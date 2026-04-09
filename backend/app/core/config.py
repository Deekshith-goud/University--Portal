from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database Settings
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str

    # Security Settings
    SECRET_KEY: str  # Required – must be set in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # SMTP Settings (can be optional if fallback is used)
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # Allows loading from .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
