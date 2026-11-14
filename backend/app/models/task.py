from __future__ import annotations

from datetime import date
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, Date, Float, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.timestamps import TimestampMixin


class Task(TimestampMixin, Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("approval_status IN ('pending', 'approved', 'rejected', 'needs_review')", name="ck_tasks_approval_status"),
        CheckConstraint("status IN ('not_started', 'in_progress', 'completed', 'overdue')", name="ck_tasks_status"),
        CheckConstraint("confidence_score >= 0 AND confidence_score <= 1", name="ck_tasks_confidence_score"),
        Index("ix_tasks_meeting_status", "meeting_id", "status"),
        Index("ix_tasks_owner_due_date", "owner_id", "due_date"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    meeting_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    owner_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(250), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    assignee_name: Mapped[str | None] = mapped_column(String(120))
    due_date: Mapped[date | None] = mapped_column(Date)
    due_date_original: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="not_started", server_default="not_started")
    approval_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default="pending")
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default="0")

    meeting: Mapped["Meeting"] = relationship(back_populates="tasks")
    owner: Mapped["User | None"] = relationship(back_populates="assigned_tasks", foreign_keys=[owner_id])
    evidence: Mapped[list["TaskEvidence"]] = relationship(back_populates="task", cascade="all, delete-orphan")
    sync_events: Mapped[list["TaskSyncEvent"]] = relationship(back_populates="task", cascade="all, delete-orphan")
