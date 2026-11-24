import json
import unittest
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace

from app.services.local_extraction import extract_locally, normalize_due_date


FIXTURE = Path(__file__).parent / "fixtures" / "extraction_edge_cases.json"


class ExtractionEdgeCaseTests(unittest.TestCase):
    def test_labeled_edge_case_dataset(self) -> None:
        cases = json.loads(FIXTURE.read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(cases), 4)
        for case in cases:
            with self.subTest(case=case["name"]):
                meeting = SimpleNamespace(
                    meeting_date=datetime.fromisoformat(case["meeting_date"].replace("Z", "+00:00")),
                    source_text=case["source_text"],
                )
                result = extract_locally(meeting)
                self.assertEqual(len(result.tasks), case["tasks"])
                if result.tasks:
                    task = result.tasks[0]
                    self.assertEqual(task.due_date_iso, case["due_date"])
                    self.assertEqual(task.timestamp_seconds, case["timestamp_seconds"])
                    self.assertIn(task.evidence_quote, meeting.source_text)
                    if case["name"] == "missing_owner_stays_unassigned":
                        self.assertIsNone(task.assignee_name)

    def test_relative_dates_across_week_and_month_boundaries(self) -> None:
        from datetime import date

        self.assertEqual(normalize_due_date("in 2 weeks", date(2026, 12, 28)), date(2027, 1, 11))
        self.assertEqual(normalize_due_date("next Monday", date(2026, 11, 19)), date(2026, 11, 23))
        self.assertEqual(normalize_due_date("end of month", date(2026, 2, 10)), date(2026, 2, 28))
        self.assertIsNone(normalize_due_date("sometime soon", date(2026, 11, 19)))


if __name__ == "__main__":
    unittest.main()
