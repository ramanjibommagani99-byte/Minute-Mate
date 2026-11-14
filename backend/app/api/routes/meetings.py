from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.meetings import MeetingCreate, MeetingResponse

router = APIRouter()
MAX_AUDIO_BYTES = 25 * 1024 * 1024
SUPPORTED_AUDIO_TYPES = {".flac", ".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".ogg", ".wav", ".webm"}


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Meeting:
    meeting = Meeting(
        owner_id=current_user.id,
        title=payload.title,
        meeting_date=payload.meeting_date,
        source_type=payload.source_type,
        source_text=payload.source_text,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("", response_model=list[MeetingResponse])
def list_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Meeting]:
    statement = (
        select(Meeting)
        .where(Meeting.owner_id == current_user.id)
        .order_by(Meeting.meeting_date.desc().nullslast(), Meeting.created_at.desc())
    )
    return list(db.scalars(statement).all())


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Meeting:
    meeting = db.scalar(select(Meeting).where(Meeting.id == meeting_id, Meeting.owner_id == current_user.id))
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return meeting


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    _current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    from pathlib import Path

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_AUDIO_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported audio format")
    if not settings.openai_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Audio transcription is not configured. Set OPENAI_API_KEY in backend/.env.")

    audio = await file.read(MAX_AUDIO_BYTES + 1)
    if not audio:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded audio file is empty")
    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Audio files must be 25 MB or smaller")

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                data={"model": settings.transcription_model},
                files={"file": (file.filename or "meeting-audio", audio, file.content_type or "application/octet-stream")},
            )
        response.raise_for_status()
        transcript = response.json().get("text", "").strip()
        if not transcript:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The transcription service returned no text")
        return {"text": transcript}
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The transcription service could not process this audio") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The transcription service is unavailable") from exc
