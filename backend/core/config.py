"""Application settings — single source of truth for all config values."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    CLOUDINARY_UPLOAD_PRESET: str = "SetupSpot"
    SECRET_KEY: str = "default_secret_key_change_in_prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    RESEND_API_KEY: str = ""
    FRONTEND_URL: str = "https://setupspot.tech"
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_OAUTH_REDIRECT_URI: str | None = None
    ADMIN_EMAIL: str | None = None
    ALGOLIA_APP_ID: str = "82D9UQ8ZF3"
    ALGOLIA_WRITE_API_KEY: str = ""
    ALGOLIA_INDEX_NAME: str = "setups"
    UPSTASH_REDIS_REST_URL: str | None = None
    UPSTASH_REDIS_REST_TOKEN: str | None = None
    SENTRY_DSN: str | None = None
    ENVIRONMENT: str = "development"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.is_production:
            if self.SECRET_KEY == "default_secret_key_change_in_prod" or len(self.SECRET_KEY) < 32:
                raise ValueError("A strong SECRET_KEY (at least 32 chars) must be provided in production")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
