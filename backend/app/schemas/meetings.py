from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


SourceType = Literal["transcript", "notes", "audio"]


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    project_name: str | None = Field(default=None, max_length=120)
    meeting_date: datetime | None = None
    source_type: SourceType
    source_text: str = Field(min_length=1, max_length=500_000)

    @field_validator("title", "source_text")
    @classmethod
    def trim_and_require_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value

    @field_validator("project_name")
    @classmethod
    def trim_project_name(cls, value: str | None) -> str | None:
        value = value.strip() if value else None
        return value or None


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    project_name: str | None
    meeting_date: datetime | None
    source_type: SourceType
    source_text: str
    created_at: datetime
    updated_at: datetime


class CarryOverQuestion(BaseModel):
    id: UUID
    question_text: str
    evidence_quote: str


class CarryOverTask(BaseModel):
    id: UUID
    title: str
    due_date: date
    meeting_title: str


class MeetingCarryOverResponse(BaseModel):
    meeting_id: UUID | None
    meeting_title: str | None
    open_questions: list[CarryOverQuestion]
    overdue_tasks: list[CarryOverTask]
