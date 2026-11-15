from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.meeting import Meeting
from app.models.task import Task
from app.models.task_reminder import TaskReminder
from app.models.user import User
from app.schemas.extraction import ReminderCreateRequest, ReminderResponse

router = APIRouter()


def reminder_response(reminder: TaskReminder, task: Task) -> ReminderResponse:
    return ReminderResponse(
        id=reminder.id,
        task_id=task.id,
        task_title=task.title,
        remind_at=reminder.remind_at,
        message=reminder.message,
        status=reminder.status,
        is_due=reminder.status == "scheduled" and reminder.remind_at <= datetime.now(timezone.utc),
        created_at=reminder.created_at,
        dismissed_at=reminder.dismissed_at,
    )


@router.post("/tasks/{task_id}/reminders", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def schedule_reminder(
    task_id: UUID,
    payload: ReminderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReminderResponse:
    task = db.scalar(
        select(Task)
        .join(Meeting, Meeting.id == Task.meeting_id)
        .where(Task.id == task_id, Meeting.owner_id == current_user.id)
        .with_for_update(of=Task)
    )
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role != "organizer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only organizers can schedule reminders")
    if task.approval_status != "approved":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reminders can only be scheduled for approved tasks")
    remind_at = payload.remind_at.astimezone(timezone.utc)
    if remind_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Reminder time must be in the future")

    reminder = TaskReminder(task_id=task.id, user_id=current_user.id, remind_at=remind_at, message=payload.message)
    db.add(reminder)
    db.flush()
    db.add(AuditLog(
        task_id=task.id,
        meeting_id=task.meeting_id,
        user_id=current_user.id,
        action="task.reminder_scheduled",
        new_value={"reminder_id": str(reminder.id), "remind_at": remind_at.isoformat(), "message": payload.message},
    ))
    db.commit()
    db.refresh(reminder)
    return reminder_response(reminder, task)


@router.get("/reminders", response_model=list[ReminderResponse])
def list_reminders(
    task_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ReminderResponse]:
    statement = (
        select(TaskReminder, Task)
        .join(Task, Task.id == TaskReminder.task_id)
        .where(TaskReminder.user_id == current_user.id, TaskReminder.status == "scheduled")
        .order_by(TaskReminder.remind_at.asc())
        .limit(100)
    )
    if task_id is not None:
        statement = statement.where(TaskReminder.task_id == task_id)
    rows = db.execute(statement).all()
    return [reminder_response(reminder, task) for reminder, task in rows]


@router.patch("/reminders/{reminder_id}/dismiss", response_model=ReminderResponse)
def dismiss_reminder(
    reminder_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReminderResponse:
    row = db.execute(
        select(TaskReminder, Task)
        .join(Task, Task.id == TaskReminder.task_id)
        .join(Meeting, Meeting.id == Task.meeting_id)
        .where(TaskReminder.id == reminder_id, TaskReminder.user_id == current_user.id, Meeting.owner_id == current_user.id)
        .with_for_update(of=TaskReminder)
    ).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    reminder, task = row
    if reminder.status != "dismissed":
        previous = {"status": reminder.status, "dismissed_at": reminder.dismissed_at.isoformat() if reminder.dismissed_at else None}
        reminder.status = "dismissed"
        reminder.dismissed_at = datetime.now(timezone.utc)
        db.add(AuditLog(
            task_id=task.id,
            meeting_id=task.meeting_id,
            user_id=current_user.id,
            action="task.reminder_dismissed",
            old_value=previous,
            new_value={"status": reminder.status, "dismissed_at": reminder.dismissed_at.isoformat(), "reminder_id": str(reminder.id)},
        ))
        db.commit()
        db.refresh(reminder)
    return reminder_response(reminder, task)
