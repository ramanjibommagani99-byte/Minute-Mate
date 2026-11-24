import unittest

from app.services.assemblyai import _format_timestamped_words
from app.services.trust import timestamp_for_quote


class TranscriptionTimestampTests(unittest.TestCase):
    def test_word_times_are_saved_as_sentence_markers(self) -> None:
        words = [
            {"text": "Maya", "start": 12_250},
            {"text": "will", "start": 12_700},
            {"text": "send", "start": 13_000},
            {"text": "the", "start": 13_400},
            {"text": "guide.", "start": 13_600},
            {"text": "Liam", "start": 3_605_000},
            {"text": "will", "start": 3_605_300},
            {"text": "review.", "start": 3_605_700},
        ]
        transcript = _format_timestamped_words(words, "ignored fallback")
        self.assertEqual(transcript, "[00:12] Maya will send the guide.\n[1:00:05] Liam will review.")
        self.assertEqual(timestamp_for_quote(transcript, "Maya will send the guide."), 12)
        self.assertEqual(timestamp_for_quote(transcript, "Liam will review."), 3605)

    def test_missing_word_times_uses_plain_text_without_fabricating_a_timestamp(self) -> None:
        self.assertEqual(_format_timestamped_words(None, "A plain fallback."), "A plain fallback.")


if __name__ == "__main__":
    unittest.main()
