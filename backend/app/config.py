import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    MONGODB_URI: str = "mongodb+srv://darshan_user:DarshanJourney2026@cluster0.mongodb.net/darshan_journey_db?retryWrites=true&w=majority"
    DATABASE_NAME: str = "darshan_journey_db"
    JWT_SECRET_KEY: str = "darshan_journey_secret_jwt_key_2026_sacred_temple_app"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    TAVILY_API_KEY: str = ""
    WEB_SEARCH_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
