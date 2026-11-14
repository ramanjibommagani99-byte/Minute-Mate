from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.timestamps import TimestampMixin


class Meeting(TimestampMixin, Base):
    __tablename__ = "meetings"
    __table_args__ = (
        CheckConstraint("source_type IN ('transcript', 'audio', 'notes')", name="ck_meetings_source_type"),
        Index("ix_meetings_owner_date", "owner_id", "meeting_date"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    owner_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    meeting_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_type: Mapped[str] = mapped_column(String(20), nullable=False)
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)

    owner: Mapped["User"] = relationship(back_populates="meetings")
    participants: Mapped[list["Participant"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    tasks: Mapped[list["Task"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    decisions: Mapped[list["Decision"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    risks: Mapped[list["MeetingRisk"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    open_questions: Mapped[list["OpenQuestion"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")
