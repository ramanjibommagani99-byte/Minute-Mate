from pathlib import Path

from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://minutemate:minutemate@localhost:5433/minutemate"
    jwt_secret: str = Field(default="minutemate-local-development-secret-change-before-deploying", min_length=32)
    jwt_expire_minutes: int = 60
    assemblyai_api_key: str = ""
    extraction_provider: Literal["ollama", "local"] = "ollama"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "qwen3:1.7b"
    frontend_origin: str = "http://localhost:3000"
    cookie_secure: bool = False
    cookie_name: str = "minutemate_access_token"

    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parents[2] / ".env", extra="ignore")

    @property
    def effective_extraction_provider(self) -> Literal["ollama", "local"]:
        """Hosted production must not depend on a machine-local Ollama daemon."""
        if self.app_env.strip().casefold() == "production":
            return "local"
        return self.extraction_provider


settings = Settings()
