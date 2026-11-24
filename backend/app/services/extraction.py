import re
import unicodedata
import logging
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.meeting import Meeting
from app.schemas.extraction import MeetingExtraction
from app.services.local_extraction import extract_locally
from app.services.ollama_extraction import extract_with_ollama

logger = logging.getLogger(__name__)


def normalize_quote(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).casefold()
    return re.sub(r"\s+", " ", normalized).strip()


def validate_evidence(source_text: str, extraction: MeetingExtraction) -> bool:
    source = normalize_quote(source_text)
    quotes = [item.evidence_quote for group in (
        extraction.tasks,
        extraction.decisions,
        extraction.risks,
        extraction.open_questions,
    ) for item in group]
    return all(normalize_quote(quote) in source for quote in quotes)


async def extract_meeting(meeting: Meeting) -> MeetingExtraction:
    provider = settings.effective_extraction_provider
    if provider == "local":
        return extract_locally(meeting)
    try:
        extraction = await extract_with_ollama(meeting)
    except HTTPException as exc:
        if exc.status_code != status.HTTP_504_GATEWAY_TIMEOUT:
            raise
        logger.warning("Ollama timed out; using local pattern extraction for meeting %s", meeting.id)
        extraction = extract_locally(meeting)
        extraction.summary = (
            "Ollama took too long, so this proposal uses the cost-free local pattern fallback. "
            + extraction.summary
        )
        return extraction
    if not validate_evidence(meeting.source_text, extraction):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The local model returned unsupported evidence. Review the source and retry extraction.",
        )
    return extraction
