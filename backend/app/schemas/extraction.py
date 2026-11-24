from datetime import date, datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class _StrictOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ProposedTask(_StrictOutput):
    title: str = Field(min_length=1, max_length=250)
    description: str | None
    assignee_name: str | None = Field(max_length=120)
    due_date_iso: str | None
    due_date_original: str | None = Field(max_length=120)
    confidence_score: float = Field(ge=0, le=1)
    evidence_quote: str = Field(min_length=1)
    timestamp_seconds: int | None = Field(ge=0)

    @field_validator("title", "evidence_quote")
    @classmethod
    def require_nonblank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This value cannot be blank")
        return value

    @field_validator("due_date_iso")
    @classmethod
    def require_iso_date(cls, value: str | None) -> str | None:
        if value is not None:
            date.fromisoformat(value)
        return value


class ExtractedDecision(_StrictOutput):
    decision_text: str = Field(min_length=1)
    confidence_score: float = Field(ge=0, le=1)
    evidence_quote: str = Field(min_length=1)


class ExtractedRisk(_StrictOutput):
    risk_text: str = Field(min_length=1)
    impact: str | None
    confidence_score: float = Field(ge=0, le=1)
    evidence_quote: str = Field(min_length=1)


class ExtractedQuestion(_StrictOutput):
    question_text: str = Field(min_length=1)
    confidence_score: float = Field(ge=0, le=1)
    evidence_quote: str = Field(min_length=1)


class MeetingExtraction(_StrictOutput):
    summary: str = Field(min_length=1)
    tasks: list[ProposedTask]
    decisions: list[ExtractedDecision]
    risks: list[ExtractedRisk]
    open_questions: list[ExtractedQuestion]


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    quote_text: str
    timestamp_seconds: int | None
    match_score: float | None


class TaskTrustResponse(BaseModel):
    evidence_valid: bool
    timestamp_valid: bool
    date_valid: bool
    confidence_valid: bool
    ready_for_approval: bool
    warnings: list[str]


class TaskProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    description: str | None
    assignee_name: str | None
    due_date: date | None
    due_date_original: str | None
    status: str
    approval_status: str
    confidence_score: float
    evidence: list[EvidenceResponse]
    trust: TaskTrustResponse


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    decision_text: str
    evidence_quote: str
    confidence_score: float


class RiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    risk_text: str
    impact: str | None
    evidence_quote: str
    confidence_score: float


class OpenQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    question_text: str
    evidence_quote: str
    confidence_score: float


class MeetingExtractionResponse(BaseModel):
    meeting_id: UUID
    meeting_title: str
    summary: str | None
    tasks: list[TaskProposalResponse]
    decisions: list[DecisionResponse]
    risks: list[RiskResponse]
    open_questions: list[OpenQuestionResponse]


class TaskUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(default=None, min_length=1, max_length=250)
    description: str | None = None
    assignee_name: str | None = Field(default=None, max_length=120)
    due_date: date | None = None
    due_date_original: str | None = Field(default=None, max_length=120)
    evidence_quote: str | None = Field(default=None, min_length=1)
    timestamp_seconds: int | None = Field(default=None, ge=0)

    @field_validator("title", "evidence_quote")
    @classmethod
    def reject_blank_update(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError("This value cannot be blank")
        return value


class TaskDecisionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: Literal["approve", "reject", "flag"]
    note: str | None = Field(default=None, max_length=1000)


class TaskHistoryResponse(BaseModel):
    id: UUID
    action: str
    user_id: UUID | None
    old_value: dict[str, Any] | None
    new_value: dict[str, Any] | None
    created_at: datetime


class TaskStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["not_started", "in_progress", "completed", "overdue"]


class TaskTrackingResponse(TaskProposalResponse):
    meeting_id: UUID
    meeting_title: str
    project_name: str | None
    meeting_date: datetime | None


class ReminderCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    remind_at: datetime
    message: str | None = Field(default=None, max_length=500)

    @field_validator("remind_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("remind_at must include a timezone")
        return value

    @field_validator("message")
    @classmethod
    def normalize_message(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
        return value or None


class ReminderResponse(BaseModel):
    id: UUID
    task_id: UUID
    task_title: str
    remind_at: datetime
    message: str | None
    status: Literal["scheduled", "dismissed"]
    is_due: bool
    created_at: datetime
    dismissed_at: datetime | None


class DemoSyncRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    provider: Literal["slack", "google_calendar"]


class TaskSyncEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    task_id: UUID
    provider: Literal["slack", "google_calendar"]
    external_task_id: str | None
    sync_status: Literal["pending", "succeeded", "failed"]
    error_message: str | None
    created_at: datetime
    demo_only: bool = True


def extraction_schema() -> dict[str, Any]:
    """Strict JSON Schema for the meeting extraction response (all keys are required)."""
    def nullable_string() -> dict[str, Any]:
        return {"type": ["string", "null"]}

    def item(properties: dict[str, Any]) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": properties,
            "required": list(properties),
            "additionalProperties": False,
        }

    return item({
        "summary": {"type": "string"},
        "tasks": {
            "type": "array",
            "items": item({
                "title": {"type": "string"},
                "description": nullable_string(),
                "assignee_name": nullable_string(),
                "due_date_iso": nullable_string(),
                "due_date_original": nullable_string(),
                "confidence_score": {"type": "number"},
                "evidence_quote": {"type": "string"},
                "timestamp_seconds": {"type": ["integer", "null"]},
            }),
        },
        "decisions": {
            "type": "array",
            "items": item({
                "decision_text": {"type": "string"},
                "confidence_score": {"type": "number"},
                "evidence_quote": {"type": "string"},
            }),
        },
        "risks": {
            "type": "array",
            "items": item({
                "risk_text": {"type": "string"},
                "impact": nullable_string(),
                "confidence_score": {"type": "number"},
                "evidence_quote": {"type": "string"},
            }),
        },
        "open_questions": {
            "type": "array",
            "items": item({
                "question_text": {"type": "string"},
                "confidence_score": {"type": "number"},
                "evidence_quote": {"type": "string"},
            }),
        },
    })
