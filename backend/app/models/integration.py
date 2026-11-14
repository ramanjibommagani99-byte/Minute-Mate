from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, ForeignKey, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.timestamps import TimestampMixin


class Integration(TimestampMixin, Base):
    __tablename__ = "integrations"
    __table_args__ = (
        UniqueConstraint("user_id", "provider", name="uq_integrations_user_provider"),
        CheckConstraint("provider IN ('slack', 'google_calendar', 'notion', 'trello', 'jira')", name="ck_integrations_provider"),
        CheckConstraint("connection_status IN ('disconnected', 'connected', 'error')", name="ck_integrations_connection_status"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(30), nullable=False)
    connection_status: Mapped[str] = mapped_column(String(20), nullable=False, default="disconnected", server_default="disconnected")

    user: Mapped["User"] = relationship(back_populates="integrations")
