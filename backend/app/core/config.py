from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://minutemate:minutemate@localhost:5433/minutemate"
    jwt_secret: str = Field(default="minutemate-local-development-secret-change-before-deploying", min_length=32)
    jwt_expire_minutes: int = 60
    openai_api_key: str = ""
    transcription_model: str = "gpt-transcribe"
    frontend_origin: str = "http://localhost:3000"
    cookie_secure: bool = False
    cookie_name: str = "minutemate_access_token"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
