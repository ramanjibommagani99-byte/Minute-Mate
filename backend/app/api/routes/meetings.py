from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.decision import Decision
from app.models.meeting import Meeting
from app.models.meeting_risk import MeetingRisk
from app.models.open_question import OpenQuestion
from app.models.task import Task
from app.models.task_evidence import TaskEvidence
from app.models.user import User
from app.services.assemblyai import transcribe_audio as transcribe_with_assemblyai
from app.schemas.extraction import (
    DecisionResponse,
    MeetingExtractionResponse,
    OpenQuestionResponse,
    RiskResponse,
    TaskProposalResponse,
)
from app.schemas.meetings import MeetingCarryOverResponse, MeetingCreate, MeetingResponse
from app.services.extraction import extract_meeting
from app.services.trust import LOW_CONFIDENCE_THRESHOLD, check_task_trust, serialize_task

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
        project_name=payload.project_name,
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


@router.get("/carry-over", response_model=MeetingCarryOverResponse)
def get_meeting_carry_over(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MeetingCarryOverResponse:
    previous = db.scalar(
        select(Meeting)
        .where(Meeting.owner_id == current_user.id)
        .order_by(Meeting.created_at.desc(), Meeting.id.desc())
        .limit(1)
    )
    if previous is None:
        return MeetingCarryOverResponse(meeting_id=None, meeting_title=None, open_questions=[], overdue_tasks=[])

    questions = db.scalars(
        select(OpenQuestion)
        .where(OpenQuestion.meeting_id == previous.id)
        .order_by(OpenQuestion.id)
    ).all()
    overdue_rows = db.execute(
        select(Task, Meeting)
        .join(Meeting, Meeting.id == Task.meeting_id)
        .where(
            Meeting.owner_id == current_user.id,
            Task.meeting_id == previous.id,
            Task.approval_status == "approved",
            Task.status != "completed",
            Task.due_date.is_not(None),
            Task.due_date < date.today(),
        )
        .order_by(Task.due_date, Task.title)
        .limit(20)
    ).all()
    return MeetingCarryOverResponse(
        meeting_id=previous.id,
        meeting_title=previous.title,
        open_questions=[
            {"id": item.id, "question_text": item.question_text, "evidence_quote": item.evidence_quote}
            for item in questions
        ],
        overdue_tasks=[
            {"id": task.id, "title": task.title, "due_date": task.due_date, "meeting_title": meeting.title}
            for task, meeting in overdue_rows
        ],
    )


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
    audio = await file.read(MAX_AUDIO_BYTES + 1)
    if not audio:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded audio file is empty")
    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Audio files must be 25 MB or smaller")

    transcript = await transcribe_with_assemblyai(audio)
    return {"text": transcript}


def extraction_result(db: Session, meeting: Meeting) -> MeetingExtractionResponse:
    tasks = db.scalars(select(Task).where(Task.meeting_id == meeting.id).order_by(Task.created_at, Task.id)).all()
    decisions = db.scalars(select(Decision).where(Decision.meeting_id == meeting.id).order_by(Decision.id)).all()
    risks = db.scalars(select(MeetingRisk).where(MeetingRisk.meeting_id == meeting.id).order_by(MeetingRisk.id)).all()
    questions = db.scalars(select(OpenQuestion).where(OpenQuestion.meeting_id == meeting.id).order_by(OpenQuestion.id)).all()
    return MeetingExtractionResponse(
        meeting_id=meeting.id,
        meeting_title=meeting.title,
        summary=meeting.summary,
        tasks=[serialize_task(meeting, task) for task in tasks],
        decisions=[DecisionResponse.model_validate(item) for item in decisions],
        risks=[RiskResponse.model_validate(item) for item in risks],
        open_questions=[OpenQuestionResponse.model_validate(item) for item in questions],
    )


def get_owned_meeting(db: Session, meeting_id: UUID, current_user: User) -> Meeting:
    meeting = db.scalar(select(Meeting).where(Meeting.id == meeting_id, Meeting.owner_id == current_user.id))
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return meeting


@router.get("/{meeting_id}/extraction", response_model=MeetingExtractionResponse)
def get_meeting_extraction(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MeetingExtractionResponse:
    meeting = get_owned_meeting(db, meeting_id, current_user)
    return extraction_result(db, meeting)


@router.post("/{meeting_id}/extract", response_model=MeetingExtractionResponse)
async def create_meeting_extraction(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MeetingExtractionResponse:
    meeting = get_owned_meeting(db, meeting_id, current_user)
    existing_approved = db.scalar(
        select(Task.id).where(
            Task.meeting_id == meeting.id,
            Task.approval_status.in_(("approved", "rejected")),
        ).limit(1)
    )
    if existing_approved is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This meeting has reviewed tasks; create a new meeting to extract a fresh proposal.",
        )

    extraction = await extract_meeting(meeting)
    try:
        db.execute(delete(Task).where(Task.meeting_id == meeting.id))
        db.execute(delete(Decision).where(Decision.meeting_id == meeting.id))
        db.execute(delete(MeetingRisk).where(MeetingRisk.meeting_id == meeting.id))
        db.execute(delete(OpenQuestion).where(OpenQuestion.meeting_id == meeting.id))
        meeting.summary = extraction.summary

        for proposal in extraction.tasks:
            task = Task(
                meeting_id=meeting.id,
                title=proposal.title,
                description=proposal.description,
                assignee_name=proposal.assignee_name,
                due_date=date.fromisoformat(proposal.due_date_iso) if proposal.due_date_iso else None,
                due_date_original=proposal.due_date_original,
                confidence_score=proposal.confidence_score,
                approval_status="pending",
            )
            task.evidence.append(TaskEvidence(
                quote_text=proposal.evidence_quote,
                timestamp_seconds=proposal.timestamp_seconds,
                match_score=1.0,
            ))
            trust = check_task_trust(meeting, task)
            if not trust.ready_for_approval or task.confidence_score < LOW_CONFIDENCE_THRESHOLD:
                task.approval_status = "needs_review"
            db.add(task)
            db.flush()
            db.add(AuditLog(
                task_id=task.id,
                meeting_id=meeting.id,
                user_id=current_user.id,
                action="task.proposed",
                new_value={
                    "title": task.title,
                    "description": task.description,
                    "assignee_name": task.assignee_name,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "due_date_original": task.due_date_original,
                    "approval_status": task.approval_status,
                    "confidence_score": task.confidence_score,
                    "evidence": [{"quote_text": item.quote_text, "timestamp_seconds": item.timestamp_seconds} for item in task.evidence],
                },
            ))

        db.add_all([
            Decision(meeting_id=meeting.id, decision_text=item.decision_text, evidence_quote=item.evidence_quote, confidence_score=item.confidence_score)
            for item in extraction.decisions
        ])
        db.add_all([
            MeetingRisk(meeting_id=meeting.id, risk_text=item.risk_text, impact=item.impact, evidence_quote=item.evidence_quote, confidence_score=item.confidence_score)
            for item in extraction.risks
        ])
        db.add_all([
            OpenQuestion(meeting_id=meeting.id, question_text=item.question_text, evidence_quote=item.evidence_quote, confidence_score=item.confidence_score)
            for item in extraction.open_questions
        ])
        db.add(AuditLog(
            meeting_id=meeting.id,
            user_id=current_user.id,
            action="meeting.extracted",
            new_value={
                "tasks": len(extraction.tasks),
                "decisions": len(extraction.decisions),
                "risks": len(extraction.risks),
                "open_questions": len(extraction.open_questions),
            },
        ))
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(meeting)
    return extraction_result(db, meeting)
