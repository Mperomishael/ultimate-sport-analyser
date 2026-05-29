"""
Application configuration using pydantic-settings
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API
    DEBUG: bool = False
    PREDICTION_SERVICE_API_KEY: str = "prediction-service-internal-key"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    ALLOWED_HOSTS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/football_predictions"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # API Keys
    API_FOOTBALL_KEY: str = ""
    API_FOOTBALL_HOST: str = "v3.football.api-sports.io"
    THE_ODDS_API_KEY: str = ""

    # Model paths
    MODEL_PATH: str = "./models"

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
