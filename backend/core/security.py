"""JWT creation, verification, and revocation helpers."""
from datetime import datetime, timedelta, timezone

from fastapi import Response
from jose import JWTError, jwt

from core.config import settings

ALGORITHM = "HS256"
COOKIE_NAME = "access_token"


def create_access_token(subject: int) -> str:
    """Create a signed JWT for the given user ID."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def set_auth_cookie(response: Response, token: str) -> None:
    """Write the JWT into a secure, HTTP-only cookie."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, path="/")


def revoke_token(token: str) -> None:
    """Blocklist a token in Redis until its natural expiry."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp", 0)
        ttl = max(0, exp - int(datetime.now(timezone.utc).timestamp()))
        if ttl > 0:
            from core import redis_client
            redis_client.set_json(f"revoked:{token}", 1, ttl_seconds=ttl)
    except JWTError:
        pass


def decode_access_token(token: str) -> int | None:
    """Decode a JWT and return the user ID, or None if invalid/expired/revoked."""
    try:
        from core import redis_client
        if redis_client.get_json(f"revoked:{token}") is not None:
            return None
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except JWTError:
        return None
