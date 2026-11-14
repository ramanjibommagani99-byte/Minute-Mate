from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, Float, ForeignKey, Index, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OpenQuestion(Base):
    __tablename__ = "open_questions"
    __table_args__ = (
        CheckConstraint("confidence_score >= 0 AND confidence_score <= 1", name="ck_open_questions_confidence_score"),
        Index("ix_open_questions_meeting", "meeting_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    meeting_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_quote: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)

    meeting: Mapped["Meeting"] = relationship(back_populates="open_questions")
