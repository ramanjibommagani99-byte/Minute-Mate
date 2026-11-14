from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TaskEvidence(Base):
    __tablename__ = "task_evidence"
    __table_args__ = (
        CheckConstraint("timestamp_seconds IS NULL OR timestamp_seconds >= 0", name="ck_task_evidence_timestamp"),
        CheckConstraint("match_score IS NULL OR (match_score >= 0 AND match_score <= 1)", name="ck_task_evidence_match_score"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    task_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    quote_text: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp_seconds: Mapped[int | None] = mapped_column(Integer)
    match_score: Mapped[float | None] = mapped_column(Float)

    task: Mapped["Task"] = relationship(back_populates="evidence")
