import unittest
from datetime import date
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from starlette.requests import Request
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.routes import meetings, reminders, tasks
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.db.base import Base
from app.models import AuditLog, TaskSyncEvent, User
from app.schemas.extraction import (
    DemoSyncRequest,
    MeetingExtraction,
    ReminderCreateRequest,
    TaskDecisionRequest,
    TaskStatusUpdateRequest,
)
from app.schemas.meetings import MeetingCreate
from app.services.extraction import validate_evidence


SOURCE = "[00:12] Rahul will prepare the client demo by December 10, 2026."


def run_without_io(coroutine):
    """Run a coroutine that only awaits the already-resolved extraction stub."""
    try:
        coroutine.send(None)
    except StopIteration as result:
        return result.value
    raise AssertionError("The mocked workflow unexpectedly awaited external I/O")


def proposed_extraction(*, owner: str | None = "Rahul", due_date: str | None = "2026-12-10") -> MeetingExtraction:
    return MeetingExtraction.model_validate({
        "summary": "Rahul will prepare the client demo.",
        "tasks": [{
            "title": "Prepare the client demo",
            "description": "Prepare the client demo for the team.",
            "assignee_name": owner,
            "due_date_iso": due_date,
            "due_date_original": "December 10, 2026" if due_date else "Friday (date unclear)",
            "confidence_score": 0.92,
            "evidence_quote": "Rahul will prepare the client demo by December 10, 2026.",
            "timestamp_seconds": 12,
        }],
        "decisions": [],
        "risks": [],
        "open_questions": [],
    })


class AcceptanceWorkflowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine, expire_on_commit=False)
        self.user = User(
            display_name="Workflow Tester",
            email="workflow@example.test",
            password_hash="unused-in-direct-route-test",
            role="organizer",
        )
        self.db.add(self.user)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def make_meeting(self):
        return meetings.create_meeting(MeetingCreate(
            title="Client demo planning",
            project_name="Website Launch",
            meeting_date="2026-12-01T10:00:00Z",
            source_type="transcript",
            source_text=SOURCE,
        ), self.db, self.user)

    def test_transcript_requires_review_before_local_demo_actions_and_reaches_dashboard(self) -> None:
        request = Request({"type": "http", "method": "GET", "path": "/tasks", "headers": [], "query_string": b""})
        with self.assertRaises(HTTPException) as unauthenticated:
            get_current_user(request, self.db)
        self.assertEqual(unauthenticated.exception.status_code, 401)

        token_request = Request({
            "type": "http", "method": "GET", "path": "/tasks",
            "headers": [(b"cookie", f"minutemate_access_token={create_access_token(str(self.user.id))}".encode())],
            "query_string": b"",
        })
        self.assertEqual(get_current_user(token_request, self.db).id, self.user.id)

        meeting = self.make_meeting()
        with patch("app.api.routes.meetings.extract_meeting", new=AsyncMock(return_value=proposed_extraction())) as extractor:
            extraction = run_without_io(meetings.create_meeting_extraction(meeting.id, self.db, self.user))
        extractor.assert_awaited_once()
        task = extraction.tasks[0]
        self.assertEqual(task.approval_status, "pending")
        self.assertTrue(task.trust.ready_for_approval)

        with self.assertRaises(HTTPException) as demo_before_approval:
            tasks.create_demo_sync_event(task.id, DemoSyncRequest(provider="slack"), self.db, self.user)
        self.assertEqual(demo_before_approval.exception.status_code, 409)
        with self.assertRaises(HTTPException) as status_before_approval:
            tasks.update_task_status(task.id, TaskStatusUpdateRequest(status="in_progress"), self.db, self.user)
        self.assertEqual(status_before_approval.exception.status_code, 409)
        with self.assertRaises(HTTPException) as reminder_before_approval:
            reminders.schedule_reminder(
                task.id,
                ReminderCreateRequest(remind_at="2027-01-01T10:00:00Z"),
                self.db,
                self.user,
            )
        self.assertEqual(reminder_before_approval.exception.status_code, 409)
        self.assertEqual(self.db.scalar(select(func.count()).select_from(TaskSyncEvent)), 0)

        approved = tasks.decide_task(task.id, TaskDecisionRequest(action="approve"), self.db, self.user)
        self.assertEqual(approved.approval_status, "approved")
        dashboard = tasks.list_tasks("approved", None, self.db, self.user)
        self.assertEqual([item.id for item in dashboard], [task.id])
        project_dashboard = tasks.list_tasks("approved", None, self.db, self.user, project_name="launch")
        self.assertEqual([item.id for item in project_dashboard], [task.id])
        owner_dashboard = tasks.list_tasks("approved", None, self.db, self.user, assignee_name="rah")
        self.assertEqual([item.id for item in owner_dashboard], [task.id])
        date_dashboard = tasks.list_tasks("approved", None, self.db, self.user, due_date_from=date(2026, 12, 10), due_date_to=date(2026, 12, 10))
        self.assertEqual([item.id for item in date_dashboard], [task.id])

        for provider in ("slack", "google_calendar"):
            event = tasks.create_demo_sync_event(task.id, DemoSyncRequest(provider=provider), self.db, self.user)
            self.assertTrue(event.external_task_id.startswith("demo-"))
            self.assertEqual(event.sync_status, "succeeded")

        sync_count = self.db.scalar(select(func.count()).select_from(TaskSyncEvent))
        actions = set(self.db.scalars(select(AuditLog.action)).all())
        self.assertEqual(sync_count, 2)
        self.assertIn("task.approved", actions)
        self.assertIn("task.demo_integration_triggered", actions)

    def test_dashboard_rejects_inverted_deadline_range(self) -> None:
        with self.assertRaises(HTTPException) as invalid_range:
            tasks.list_tasks("all", None, self.db, self.user, due_date_from=date(2026, 12, 11), due_date_to=date(2026, 12, 10))
        self.assertEqual(invalid_range.exception.status_code, 422)

    def test_review_filter_includes_pending_and_flagged_but_excludes_approved(self) -> None:
        pending_meeting = self.make_meeting()
        flagged_meeting = self.make_meeting()
        approved_meeting = self.make_meeting()
        with patch("app.api.routes.meetings.extract_meeting", new=AsyncMock(return_value=proposed_extraction())):
            pending_task = run_without_io(meetings.create_meeting_extraction(pending_meeting.id, self.db, self.user)).tasks[0]
            flagged_task = run_without_io(meetings.create_meeting_extraction(flagged_meeting.id, self.db, self.user)).tasks[0]
            approved_task = run_without_io(meetings.create_meeting_extraction(approved_meeting.id, self.db, self.user)).tasks[0]

        tasks.decide_task(flagged_task.id, TaskDecisionRequest(action="flag"), self.db, self.user)
        tasks.decide_task(approved_task.id, TaskDecisionRequest(action="approve"), self.db, self.user)

        review_items = tasks.list_tasks("review", None, self.db, self.user)
        self.assertEqual({item.id for item in review_items}, {pending_task.id, flagged_task.id})
        approved_items = tasks.list_tasks("approved", None, self.db, self.user)
        self.assertEqual({item.id for item in approved_items}, {approved_task.id})

    def test_quote_mismatch_is_rejected(self) -> None:
        extraction = proposed_extraction()
        extraction.tasks[0].evidence_quote = "A fabricated promise not in the transcript."
        self.assertFalse(validate_evidence(SOURCE, extraction))

    def test_missing_owner_and_ambiguous_date_remain_unresolved(self) -> None:
        extraction = proposed_extraction(owner=None, due_date=None)
        proposal = extraction.tasks[0]
        self.assertIsNone(proposal.assignee_name)
        self.assertIsNone(proposal.due_date_iso)
        self.assertEqual(proposal.due_date_original, "Friday (date unclear)")

    def test_non_action_source_can_return_no_proposals(self) -> None:
        extraction = MeetingExtraction.model_validate({
            "summary": "The team shared general updates.",
            "tasks": [],
            "decisions": [],
            "risks": [],
            "open_questions": [],
        })
        self.assertEqual(extraction.tasks, [])

    def test_schema_rejects_invalid_confidence_and_negative_timestamp(self) -> None:
        raw = proposed_extraction().model_dump()
        raw["tasks"][0]["confidence_score"] = 1.1
        with self.assertRaises(ValueError):
            MeetingExtraction.model_validate(raw)

        raw = proposed_extraction().model_dump()
        raw["tasks"][0]["timestamp_seconds"] = -1
        with self.assertRaises(ValueError):
            MeetingExtraction.model_validate(raw)


if __name__ == "__main__":
    unittest.main()
