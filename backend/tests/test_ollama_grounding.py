import unittest
from datetime import datetime, timezone
from types import SimpleNamespace

from app.schemas.extraction import MeetingExtraction
from app.services.ollama_extraction import _normalize_and_ground


class OllamaGroundingTests(unittest.TestCase):
    def test_strips_time_markers_and_routes_decisions_risks_and_questions_out_of_tasks(self) -> None:
        source = (
            "[00:12] Maya will send the launch guide by November 24, 2026.\n"
            "[00:37] We decided to postpone the partner flow.\n"
            "[00:52] Legal approval may delay the launch.\n"
            "[01:05] Do we need a separate enterprise version?"
        )
        meeting = SimpleNamespace(meeting_date=datetime(2026, 11, 19, tzinfo=timezone.utc), source_text=source)
        timestamped_decision = "[00:37] We decided to postpone the partner flow."
        timestamped_risk = "[00:52] Legal approval may delay the launch."
        timestamped_question = "[01:05] Do we need a separate enterprise version?"
        extraction = MeetingExtraction.model_validate({
            "summary": "Launch planning outcomes.",
            "tasks": [
                {"title": "Send the launch guide", "description": None, "assignee_name": "Maya", "due_date_iso": "2026-11-24", "due_date_original": "November 24, 2026", "confidence_score": 0.9, "evidence_quote": "Maya will send the launch guide by November 24, 2026.", "timestamp_seconds": None},
                {"title": "Postpone the partner flow", "description": None, "assignee_name": None, "due_date_iso": None, "due_date_original": None, "confidence_score": 0.8, "evidence_quote": timestamped_decision, "timestamp_seconds": 37},
                {"title": "Legal approval delay", "description": None, "assignee_name": None, "due_date_iso": None, "due_date_original": None, "confidence_score": 0.8, "evidence_quote": timestamped_risk, "timestamp_seconds": 52},
                {"title": "Enterprise version question", "description": None, "assignee_name": None, "due_date_iso": None, "due_date_original": None, "confidence_score": 0.8, "evidence_quote": timestamped_question, "timestamp_seconds": 65},
            ],
            "decisions": [
                {"decision_text": "Postpone the partner flow", "confidence_score": 0.9, "evidence_quote": timestamped_decision},
                {"decision_text": "Legal approval may delay the launch", "confidence_score": 0.8, "evidence_quote": timestamped_risk},
                {"decision_text": "Do we need a separate enterprise version?", "confidence_score": 0.8, "evidence_quote": timestamped_question},
            ],
            "risks": [{"risk_text": "Legal approval may delay the launch", "impact": None, "confidence_score": 0.8, "evidence_quote": timestamped_risk}],
            "open_questions": [{"question_text": "Separate enterprise version", "confidence_score": 0.8, "evidence_quote": timestamped_question}],
        })

        result = _normalize_and_ground(meeting, extraction)

        self.assertEqual(len(result.tasks), 1)
        self.assertEqual(result.tasks[0].assignee_name, "Maya")
        self.assertEqual(result.tasks[0].due_date_iso, "2026-11-24")
        self.assertEqual(result.tasks[0].timestamp_seconds, 12)
        self.assertEqual(len(result.decisions), 1)
        self.assertEqual(len(result.risks), 1)
        self.assertEqual(len(result.open_questions), 1)
        self.assertNotIn("[00:37]", result.decisions[0].evidence_quote)
        self.assertIn(result.decisions[0].evidence_quote, source)


if __name__ == "__main__":
    unittest.main()
