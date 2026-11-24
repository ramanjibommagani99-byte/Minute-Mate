import re
from calendar import monthrange
from datetime import date, datetime, timedelta

from app.models.meeting import Meeting
from app.schemas.extraction import (
    ExtractedDecision,
    ExtractedQuestion,
    ExtractedRisk,
    MeetingExtraction,
    ProposedTask,
)
from app.services.trust import timestamp_for_quote

TASK_PATTERN = re.compile(
    r"^(?:(?P<speaker>[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)*):\s*)?"
    r"(?P<owner>I|we|[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)*)\s+"
    r"(?:will|must|should|needs? to|has to|have to|is responsible for)\s+"
    r"(?P<action>.+?)(?:\s+by\s+(?P<due>[^.!?]+))?[.!]?$",
    re.IGNORECASE,
)
TIMESTAMP_PREFIX = re.compile(
    r"^\s*(?:\[(?P<bracket>(?:\d{1,2}:)?\d{1,2}:\d{2})\]"
    r"|\((?P<paren>(?:\d{1,2}:)?\d{1,2}:\d{2})\)"
    r"|(?P<bare>(?:\d{1,2}:)?\d{1,2}:\d{2})(?:\s*[-:]?)?)\s*(?P<body>.*)$"
)
DATE_FORMATS = ("%B %d, %Y", "%b %d, %Y", "%B %d %Y", "%b %d %Y", "%Y-%m-%d")
YEARLESS_DATE_PATTERN = re.compile(r"(?P<month>[A-Za-z]+)\s+(?P<day>\d{1,2})$")
ORDINAL_SUFFIX = re.compile(r"(?<=\d)(st|nd|rd|th)\b", re.IGNORECASE)
WEEKDAYS = {name.casefold(): index for index, name in enumerate((
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
))}
DEADLINE_SUFFIX = re.compile(
    r"\s+(?P<phrase>(?:by\s+|before\s+|on\s+)?(?:the\s+)?"
    r"(?:day after tomorrow|tomorrow|today|end of (?:the )?(?:day|week|month)|eow|eod|"
    r"in\s+\d+\s+(?:days?|weeks?)|(?:this|next)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"\d{4}-\d{2}-\d{2}|[A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?))\s*[.!?]?$",
    re.IGNORECASE,
)
SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")


def _parse_timestamp(value: str) -> int | None:
    parts = [int(part) for part in value.split(":")]
    if len(parts) == 2:
        minutes, seconds = parts
        hours = 0
    elif len(parts) == 3:
        hours, minutes, seconds = parts
    else:
        return None
    if minutes > 59 or seconds > 59:
        return None
    return hours * 3600 + minutes * 60 + seconds


def _split_source(source_text: str) -> list[tuple[str, int | None]]:
    segments: list[tuple[str, int | None]] = []
    for line in source_text.splitlines() or [source_text]:
        timestamp: int | None = None
        match = TIMESTAMP_PREFIX.match(line)
        if match:
            timestamp = _parse_timestamp(match.group("bracket") or match.group("paren") or match.group("bare") or "")
            line = match.group("body")
        line = re.sub(r"^\s*(?:[-*•]\s*)", "", line).strip()
        if not line:
            continue
        for sentence in SENTENCE_SPLIT.split(line):
            cleaned = sentence.strip()
            if cleaned:
                segments.append((cleaned, timestamp))
    return segments


def _reference_date(meeting: Meeting) -> date | None:
    return meeting.meeting_date.date() if meeting.meeting_date else None


def normalize_due_date(value: str | None, reference: date | None) -> date | None:
    """Normalize explicit and common relative dates; leave vague wording unresolved."""
    if not value:
        return None
    cleaned = re.sub(r"^(?:by|before|on)\s+", "", value.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"^(?:the)\s+", "", cleaned, flags=re.IGNORECASE).strip().rstrip(".,;:")
    cleaned = ORDINAL_SUFFIX.sub("", cleaned)
    try:
        return date.fromisoformat(cleaned)
    except ValueError:
        pass
    for format_string in DATE_FORMATS:
        try:
            return datetime.strptime(cleaned, format_string).date()
        except ValueError:
            continue
    yearless_match = YEARLESS_DATE_PATTERN.fullmatch(cleaned)
    if yearless_match:
        try:
            month = datetime.strptime(yearless_match.group("month"), "%B").month
        except ValueError:
            try:
                month = datetime.strptime(yearless_match.group("month"), "%b").month
            except ValueError:
                month = 0
        if month and reference is not None:
            try:
                candidate = date(reference.year, month, int(yearless_match.group("day")))
                return date(reference.year + 1, month, candidate.day) if candidate < reference else candidate
            except ValueError:
                return None
    if reference is None:
        return None

    folded = cleaned.casefold()
    if folded in {"today", "eod", "end of day"}:
        return reference
    if folded == "tomorrow":
        return reference + timedelta(days=1)
    if folded == "day after tomorrow":
        return reference + timedelta(days=2)
    if folded in {"end of week", "eow"}:
        return reference + timedelta(days=(4 - reference.weekday()) % 7)
    if folded == "end of month":
        return date(reference.year, reference.month, monthrange(reference.year, reference.month)[1])

    interval = re.fullmatch(r"in\s+(\d+)\s+(day|days|week|weeks)", folded)
    if interval:
        amount = int(interval.group(1))
        return reference + timedelta(days=amount * (7 if interval.group(2).startswith("week") else 1))

    weekday_match = re.fullmatch(r"(?:(this|next)\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)", folded)
    if weekday_match:
        qualifier, weekday_name = weekday_match.groups()
        target = WEEKDAYS[weekday_name]
        delta = (target - reference.weekday()) % 7
        if qualifier == "next" and delta == 0:
            delta = 7
        elif qualifier == "this" and target < reference.weekday():
            return None
        return reference + timedelta(days=delta)
    return None


def _extract_due_phrase(action: str, explicit_due: str | None) -> tuple[str, str | None]:
    if explicit_due:
        return action.strip().rstrip(".,;:"), explicit_due.strip().rstrip(".,;:")
    match = DEADLINE_SUFFIX.search(action)
    if not match:
        return action.strip().rstrip("."), None
    phrase = match.group("phrase").strip().rstrip(".,;:")
    action = action[:match.start()].strip().rstrip(".,;:")
    return action, phrase


def extract_locally(meeting: Meeting) -> MeetingExtraction:
    """Cost-free fallback for explicit task, decision, risk, and question patterns."""
    tasks: list[ProposedTask] = []
    decisions: list[ExtractedDecision] = []
    risks: list[ExtractedRisk] = []
    questions: list[ExtractedQuestion] = []
    reference = _reference_date(meeting)

    for sentence, source_timestamp in _split_source(meeting.source_text):
        labeled = re.match(r"^(Decision|Risk|Open question)\s*:\s*(.+)$", sentence, re.IGNORECASE)
        if labeled:
            label, content = labeled.group(1).casefold(), labeled.group(2).strip()
            if label == "decision":
                decisions.append(ExtractedDecision(decision_text=content.rstrip("."), confidence_score=0.9, evidence_quote=sentence))
            elif label == "risk":
                risks.append(ExtractedRisk(risk_text=content.rstrip("."), impact=None, confidence_score=0.85, evidence_quote=sentence))
            else:
                questions.append(ExtractedQuestion(question_text=content.rstrip("?"), confidence_score=0.9, evidence_quote=sentence))
            continue

        if sentence.endswith("?"):
            questions.append(ExtractedQuestion(question_text=sentence.rstrip("?"), confidence_score=0.75, evidence_quote=sentence))
            continue

        if re.search(r"\b(?:might|may|could|risk|concern|blocked|blocker|delay|slip)\b", sentence, re.IGNORECASE) and re.search(r"\b(?:launch|delivery|deadline|approval|dependency|legal|privacy|schedule|risk|could|might|may)\b", sentence, re.IGNORECASE):
            risks.append(ExtractedRisk(risk_text=sentence.rstrip("."), impact=None, confidence_score=0.68, evidence_quote=sentence))
            continue

        match = TASK_PATTERN.match(sentence)
        if not match:
            continue
        speaker = match.group("speaker")
        owner = match.group("owner")
        if owner.casefold() in {"i", "we"}:
            assignee = speaker if speaker and not speaker.casefold().startswith("speaker ") else None
        else:
            assignee = owner
        action, due_original = _extract_due_phrase(match.group("action"), match.group("due"))
        if not action:
            continue
        due_date = normalize_due_date(due_original, reference)
        timestamp_seconds = timestamp_for_quote(meeting.source_text, sentence)
        if timestamp_seconds is None:
            timestamp_seconds = source_timestamp
        tasks.append(ProposedTask(
            title=action[:250],
            description=None,
            assignee_name=assignee[:120] if assignee else None,
            due_date_iso=due_date.isoformat() if due_date else None,
            due_date_original=due_original[:120] if due_original else None,
            confidence_score=0.82 if assignee else 0.58,
            evidence_quote=sentence,
            timestamp_seconds=timestamp_seconds,
        ))

    summary = (
        f"Local extraction found {len(tasks)} task(s), {len(decisions)} decision(s), "
        f"{len(risks)} risk(s), and {len(questions)} open question(s). "
        "Review each item against the original source."
    )
    return MeetingExtraction(summary=summary, tasks=tasks, decisions=decisions, risks=risks, open_questions=questions)
