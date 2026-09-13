import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "PortelX Core Engine"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security & Keys
    PORTELX_SECRET_KEY: str = "temporary_dev_secret_change_in_production_32bytes"
    SESSION_DEFAULT_TTL: int = 300  # 5 minutes in seconds

    # Redis Ephemeral Store
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_SSL: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
