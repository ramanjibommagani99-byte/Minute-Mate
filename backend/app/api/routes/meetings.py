from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.meetings import MeetingCreate, MeetingResponse

router = APIRouter()


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
