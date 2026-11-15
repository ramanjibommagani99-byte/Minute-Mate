import math
import re
import unicodedata
from dataclasses import dataclass

from app.models.meeting import Meeting
from app.models.task import Task
from app.schemas.extraction import EvidenceResponse, TaskProposalResponse, TaskTrustResponse

TIMESTAMP_PATTERN = re.compile(r"(?<!\d)(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)(?!\d)")
LOW_CONFIDENCE_THRESHOLD = 0.6


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", value).casefold()).strip()


def timestamp_markers(source_text: str) -> list[tuple[int, int]]:
    markers: list[tuple[int, int]] = []
    for match in TIMESTAMP_PATTERN.finditer(source_text):
        line_start = source_text.rfind("\n", 0, match.start()) + 1
        prefix = source_text[line_start:match.start()]
        wrapped = match.start() > 0 and source_text[match.start() - 1] in "[("
        if prefix.strip() and not prefix.rstrip().endswith(":") and not wrapped:
            continue
        hours, minutes, seconds = match.groups()
        total = int(seconds) + int(minutes) * 60 + (int(hours or 0) * 3600)
        markers.append((match.start(), total))
    return markers


def _quote_matches(source_text: str, quote: str) -> list[re.Match[str]]:
    parts = quote.strip().split()
    if not parts:
        return []
    pattern = r"\s+".join(re.escape(part) for part in parts)
    return list(re.finditer(pattern, source_text, flags=re.IGNORECASE))


def quote_exists(source_text: str, quote: str) -> bool:
    return normalize_text(quote) in normalize_text(source_text)


def timestamp_matches_source(source_text: str, quote: str, timestamp_seconds: int | None) -> bool:
    if timestamp_seconds is None:
        return True
    markers = timestamp_markers(source_text)
    if not markers:
        return False
    occurrences = _quote_matches(source_text, quote)
    if not occurrences:
        return False
    for occurrence in occurrences:
        # Blank-line-delimited sections prevent a preceding timestamp from another
        # transcript paragraph from being treated as evidence for this quote.
        paragraph_boundary = source_text.rfind("\n\n", 0, occurrence.start())
        section_start = 0 if paragraph_boundary < 0 else paragraph_boundary + 2
        preceding = [marker for marker in markers if section_start <= marker[0] < occurrence.start()]
        if preceding and preceding[-1][1] == timestamp_seconds:
            return True
    return False


@dataclass(frozen=True)
class TaskTrust:
    evidence_valid: bool
    timestamp_valid: bool
    date_valid: bool
    confidence_valid: bool
    ready_for_approval: bool
    warnings: list[str]


def check_task_trust(meeting: Meeting, task: Task) -> TaskTrust:
    evidence_valid = bool(task.evidence) and all(
        evidence.quote_text.strip() and quote_exists(meeting.source_text, evidence.quote_text)
        for evidence in task.evidence
    )
    timestamp_valid = all(
        timestamp_matches_source(meeting.source_text, evidence.quote_text, evidence.timestamp_seconds)
        for evidence in task.evidence
    )
    date_valid = task.due_date is None or bool(
        task.due_date_original and normalize_text(task.due_date_original) in normalize_text(meeting.source_text)
    )
    confidence_valid = math.isfinite(task.confidence_score) and 0 <= task.confidence_score <= 1

    warnings: list[str] = []
    if not evidence_valid:
        warnings.append("Evidence quote is missing or does not match the saved meeting source.")
    if not timestamp_valid:
        warnings.append("Evidence timestamp is not supported by a nearby transcript timestamp marker.")
    if not date_valid:
        warnings.append("Normalized due date has no matching original date wording in the source.")
    if not confidence_valid:
        warnings.append("Confidence score is outside the 0–1 range.")
    if confidence_valid and task.confidence_score < LOW_CONFIDENCE_THRESHOLD:
        warnings.append("Low model confidence; organizer review is recommended.")

    ready = evidence_valid and timestamp_valid and date_valid and confidence_valid
    return TaskTrust(evidence_valid, timestamp_valid, date_valid, confidence_valid, ready, warnings)


def serialize_task(meeting: Meeting, task: Task) -> TaskProposalResponse:
    trust = check_task_trust(meeting, task)
    return TaskProposalResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        assignee_name=task.assignee_name,
        due_date=task.due_date,
        due_date_original=task.due_date_original,
        status=task.status,
        approval_status=task.approval_status,
        confidence_score=task.confidence_score,
        evidence=[EvidenceResponse.model_validate(item) for item in task.evidence],
        trust=TaskTrustResponse(
            evidence_valid=trust.evidence_valid,
            timestamp_valid=trust.timestamp_valid,
            date_valid=trust.date_valid,
            confidence_valid=trust.confidence_valid,
            ready_for_approval=trust.ready_for_approval,
            warnings=trust.warnings,
        ),
    )
