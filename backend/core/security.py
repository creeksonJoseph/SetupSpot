"""JWT creation and verification helpers.

This module only deals with token encoding/decoding.
Password hashing lives in services/auth_service.py.
"""
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from core.config import settings

ALGORITHM = "HS256"


def create_access_token(subject: int) -> str:
    """Create a signed JWT for the given user ID."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int | None:
    """Decode a JWT and return the user ID, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except JWTError:
        return None
