from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


SourceType = Literal["transcript", "notes"]


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
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


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    meeting_date: datetime | None
    source_type: SourceType
    source_text: str
    created_at: datetime
    updated_at: datetime
