from datetime import date
from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.meeting import Meeting
from app.models.task import Task
from app.models.task_evidence import TaskEvidence
from app.models.task_sync_event import TaskSyncEvent
from app.models.user import User
from app.schemas.extraction import (
    TaskDecisionRequest,
    DemoSyncRequest,
    TaskHistoryResponse,
    TaskProposalResponse,
    TaskStatusUpdateRequest,
    TaskSyncEventResponse,
    TaskTrackingResponse,
    TaskUpdateRequest,
)
from app.services.trust import check_task_trust, quote_exists, serialize_task, timestamp_matches_source

router = APIRouter()


def tracking_response(task: Task, meeting: Meeting) -> TaskTrackingResponse:
    proposal = serialize_task(meeting, task)
    return TaskTrackingResponse(
        **proposal.model_dump(),
        meeting_id=meeting.id,
        meeting_title=meeting.title,
        project_name=meeting.project_name,
        meeting_date=meeting.meeting_date,
    )


def get_owned_task(db: Session, task_id: UUID, current_user: User) -> tuple[Task, Meeting]:
    row = db.execute(
        select(Task, Meeting)
        .join(Meeting, Meeting.id == Task.meeting_id)
        .where(Task.id == task_id, Meeting.owner_id == current_user.id)
        .with_for_update(of=Task)
    ).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return row[0], row[1]


def require_organizer(user: User) -> None:
    if user.role != "organizer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only meeting organizers can review tasks")


def task_snapshot(task: Task) -> dict:
    return {
        "title": task.title,
        "description": task.description,
        "assignee_name": task.assignee_name,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "due_date_original": task.due_date_original,
        "status": task.status,
        "approval_status": task.approval_status,
        "confidence_score": task.confidence_score,
        "evidence": [
            {"quote_text": item.quote_text, "timestamp_seconds": item.timestamp_seconds}
            for item in task.evidence
        ],
    }


def ensure_reviewable(task: Task) -> None:
    if task.approval_status in ("approved", "rejected"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This task has already been finalized")


@router.get("", response_model=list[TaskTrackingResponse])
def list_tasks(
    approval_status: Literal["pending", "approved", "needs_review", "review", "rejected", "all"] | None = Query(default=None),
    task_status: Literal["not_started", "in_progress", "completed", "overdue"] | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    assignee_name: str | None = None,
    project_name: str | None = None,
    due_date_from: date | None = None,
    due_date_to: date | None = None,
) -> list[TaskTrackingResponse]:
    if due_date_from and due_date_to and due_date_from > due_date_to:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="due_date_from must be on or before due_date_to")
    statement = select(Task, Meeting).join(Meeting, Meeting.id == Task.meeting_id).where(Meeting.owner_id == current_user.id)
    if approval_status == "all":
        pass
    elif approval_status == "review":
        statement = statement.where(Task.approval_status.in_(("pending", "needs_review")))
    elif approval_status is not None:
        statement = statement.where(Task.approval_status == approval_status)
    else:
        statement = statement.where(Task.approval_status.in_(("pending", "approved", "needs_review")))
    if task_status is not None:
        statement = statement.where(Task.status == task_status)
    if assignee_name and assignee_name.strip():
        statement = statement.where(func.lower(Task.assignee_name).contains(assignee_name.strip().casefold()))
    if project_name and project_name.strip():
        statement = statement.where(func.lower(Meeting.project_name).contains(project_name.strip().casefold()))
    if due_date_from:
        statement = statement.where(Task.due_date >= due_date_from)
    if due_date_to:
        statement = statement.where(Task.due_date <= due_date_to)
    rows = db.execute(
        statement.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
    ).all()
    return [tracking_response(task, meeting) for task, meeting in rows]


@router.get("/{task_id}", response_model=TaskTrackingResponse)
def get_task_details(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskTrackingResponse:
    task, meeting = get_owned_task(db, task_id, current_user)
    return tracking_response(task, meeting)


@router.patch("/{task_id}/status", response_model=TaskTrackingResponse)
def update_task_status(
    task_id: UUID,
    payload: TaskStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskTrackingResponse:
    require_organizer(current_user)
    task, meeting = get_owned_task(db, task_id, current_user)
    if task.approval_status != "approved":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only approved tasks can move through tracking statuses")
    if task.status == payload.status:
        return tracking_response(task, meeting)

    old_value = {"status": task.status, "approval_status": task.approval_status}
    task.status = payload.status
    db.flush()
    db.add(AuditLog(
        task_id=task.id,
        meeting_id=meeting.id,
        user_id=current_user.id,
        action="task.status_changed",
        old_value=old_value,
        new_value={"status": task.status, "approval_status": task.approval_status},
    ))
    db.commit()
    db.refresh(task)
    return tracking_response(task, meeting)


@router.post("/{task_id}/demo-sync", response_model=TaskSyncEventResponse, status_code=status.HTTP_201_CREATED)
def create_demo_sync_event(
    task_id: UUID,
    payload: DemoSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskSyncEvent:
    require_organizer(current_user)
    task, meeting = get_owned_task(db, task_id, current_user)
    if task.approval_status != "approved":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only approved tasks can be sent to a demo integration")

    event = TaskSyncEvent(
        task_id=task.id,
        provider=payload.provider,
        external_task_id=f"demo-{payload.provider}-{uuid4().hex[:12]}",
        sync_status="succeeded",
    )
    db.add(event)
    db.flush()
    db.add(AuditLog(
        task_id=task.id,
        meeting_id=meeting.id,
        user_id=current_user.id,
        action="task.demo_integration_triggered",
        new_value={"provider": payload.provider, "demo_only": True, "event_id": str(event.id)},
    ))
    db.commit()
    db.refresh(event)
    return event


@router.get("/{task_id}/demo-sync-events", response_model=list[TaskSyncEventResponse])
def list_demo_sync_events(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskSyncEvent]:
    task, _meeting = get_owned_task(db, task_id, current_user)
    return list(db.scalars(
        select(TaskSyncEvent)
        .where(TaskSyncEvent.task_id == task.id, TaskSyncEvent.provider.in_(("slack", "google_calendar")))
        .order_by(TaskSyncEvent.created_at.desc())
    ).all())


@router.get("/{task_id}/history", response_model=list[TaskHistoryResponse])
def get_task_history(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskHistoryResponse]:
    task, _meeting = get_owned_task(db, task_id, current_user)
    entries = db.scalars(
        select(AuditLog)
        .where(AuditLog.task_id == task.id)
        .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
    ).all()
    return [TaskHistoryResponse(
        id=entry.id,
        action=entry.action,
        user_id=entry.user_id,
        old_value=entry.old_value,
        new_value=entry.new_value,
        created_at=entry.created_at,
    ) for entry in entries]


@router.patch("/{task_id}", response_model=TaskProposalResponse)
def update_task(
    task_id: UUID,
    payload: TaskUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskProposalResponse:
    require_organizer(current_user)
    task, meeting = get_owned_task(db, task_id, current_user)
    ensure_reviewable(task)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Provide at least one field to update")
    if "title" in changes and changes["title"] is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Task title cannot be blank")

    old_value = task_snapshot(task)
    evidence_quote = changes.pop("evidence_quote", None) if "evidence_quote" in changes else None
    timestamp_seconds = changes.pop("timestamp_seconds", None) if "timestamp_seconds" in changes else None
    quote_was_updated = "evidence_quote" in payload.model_fields_set
    timestamp_was_updated = "timestamp_seconds" in payload.model_fields_set

    for field, value in changes.items():
        if field in {"title", "assignee_name", "due_date_original"} and isinstance(value, str):
            value = value.strip() or None
        setattr(task, field, value)

    if quote_was_updated:
        if evidence_quote is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Task evidence cannot be removed")
        if not quote_exists(meeting.source_text, evidence_quote):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Evidence quote must match the original meeting source")
        if task.evidence:
            task.evidence[0].quote_text = evidence_quote
            if not timestamp_was_updated:
                task.evidence[0].timestamp_seconds = None
        else:
            task.evidence.append(TaskEvidence(quote_text=evidence_quote, match_score=1.0))

    if timestamp_was_updated:
        if not task.evidence:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Add an evidence quote before setting its timestamp")
        quote = evidence_quote if quote_was_updated else task.evidence[0].quote_text
        if timestamp_seconds is not None and not timestamp_matches_source(meeting.source_text, quote, timestamp_seconds):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Timestamp must match a marker next to the evidence quote in the source")
        task.evidence[0].timestamp_seconds = timestamp_seconds

    # Any organizer edit returns the proposal to the review queue.
    task.approval_status = "needs_review"
    db.flush()
    new_value = task_snapshot(task)
    db.add(AuditLog(
        task_id=task.id,
        meeting_id=meeting.id,
        user_id=current_user.id,
        action="task.edited",
        old_value=old_value,
        new_value=new_value,
    ))
    db.commit()
    db.refresh(task)
    return serialize_task(meeting, task)


@router.post("/{task_id}/decision", response_model=TaskProposalResponse)
def decide_task(
    task_id: UUID,
    payload: TaskDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskProposalResponse:
    require_organizer(current_user)
    task, meeting = get_owned_task(db, task_id, current_user)
    ensure_reviewable(task)
    old_value = task_snapshot(task)

    if payload.action == "approve":
        trust = check_task_trust(meeting, task)
        blocking = [warning for warning in trust.warnings if not warning.startswith("Low model confidence")]
        if blocking:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "Resolve source trust issues before approving this task", "checks": blocking},
            )
        task.approval_status = "approved"
        audit_action = "task.approved"
    elif payload.action == "reject":
        task.approval_status = "rejected"
        audit_action = "task.rejected"
    else:
        task.approval_status = "needs_review"
        audit_action = "task.flagged"

    db.flush()
    new_value = task_snapshot(task)
    if payload.note:
        new_value["review_note"] = payload.note.strip()
    db.add(AuditLog(
        task_id=task.id,
        meeting_id=meeting.id,
        user_id=current_user.id,
        action=audit_action,
        old_value=old_value,
        new_value=new_value,
    ))
    db.commit()
    db.refresh(task)
    return serialize_task(meeting, task)
