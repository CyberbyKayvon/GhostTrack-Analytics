from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "GhostTrack"

    # Database - Uses Railway's DATABASE_URL if available, falls back to SQLite for local dev
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///./ghosttrack.db')

    # Redis
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')

    # Security - Uses environment variable in production
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
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


settings = Settings()