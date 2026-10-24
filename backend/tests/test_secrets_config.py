import pytest
from pydantic import ValidationError
from core.config import Settings

def test_secret_key_fails_fast_in_prod():
    # If ENVIRONMENT=production, SECRET_KEY should not be default or short
    with pytest.raises(ValueError):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="default_secret_key_change_in_prod",
            DATABASE_URL="sqlite:///:memory:",
            CLOUDINARY_CLOUD_NAME="test",
            CLOUDINARY_API_KEY="test",
            CLOUDINARY_API_SECRET="test",
        )
