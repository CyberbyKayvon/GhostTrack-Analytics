from pydantic_settings import BaseSettings
from typing import List
import os
import secrets


def get_secret_key() -> str:
    """
    Get SECRET_KEY from environment variable.
    Generates a secure random key for local development only.
    CRITICAL: In production, you MUST set the SECRET_KEY environment variable.
    """
    secret_key = os.getenv('SECRET_KEY')

    if not secret_key:
        # Check if we're in development mode
        env = os.getenv('ENVIRONMENT', 'development').lower()

        if env == 'production':
            raise ValueError(
                "SECRET_KEY environment variable is required in production! "
                "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )

        # For development, generate a temporary key and warn
        print("WARNING: Using auto-generated SECRET_KEY for development.")
        print("WARNING: Set SECRET_KEY environment variable for production!")
        secret_key = secrets.token_urlsafe(32)

    # Validate minimum length
    if len(secret_key) < 32:
        raise ValueError("SECRET_KEY must be at least 32 characters long")

    return secret_key


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "GhostTrack"
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'development')

    # Database - Uses Railway's DATABASE_URL if available, falls back to SQLite for local dev
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///./ghosttrack.db')

    # Redis
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')

    # Security - MUST be set in production
    SECRET_KEY: str = get_secret_key()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS - Allow your frontend and tennis website
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://kayvontennis.com",
        "http://kayvontennis.com",
        # Railway will add its own URL here automatically when deployed
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars from Railway


settings = Settings()