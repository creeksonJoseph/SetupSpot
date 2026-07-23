"""Application settings — single source of truth for all config values."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    CLOUDINARY_UPLOAD_PRESET: str = "SetupSpot"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    RESEND_API_KEY: str
    FRONTEND_URL: str = "https://setupspot.tech"
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_OAUTH_REDIRECT_URI: str | None = None
    ALGOLIA_APP_ID: str = "82D9UQ8ZF3"
    ALGOLIA_WRITE_API_KEY: str = ""
    ALGOLIA_INDEX_NAME: str = "setups"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
