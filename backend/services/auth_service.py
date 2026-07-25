import json
import logging
import random
import string
from datetime import datetime, timedelta, timezone
from urllib.request import Request, urlopen

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from core.config import settings
from core.email import send_otp_email
from core.security import create_access_token, ALGORITHM
from models.user import User
from transactions import user_repo

_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
OTP_EXPIRY_MINUTES = 15
SIGNUP_TOKEN_EXPIRY_MINUTES = 15
logger = logging.getLogger(__name__)

# In-memory OTP rate-limit stores — swap for Redis when scaling horizontally.
_signup_otps: dict[str, dict] = {}       # { email: {otp, expires_at, resend_count, window_start} }
_reset_rate: dict[str, dict] = {}        # { email: {resend_count, window_start} }
_change_rate: dict[int, dict] = {}       # { user_id: {resend_count, window_start} }

OTP_RATE_LIMIT = 4
OTP_RATE_WINDOW_MINUTES = 15


def _generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def register(db: Session, email: str, username: str, password: str) -> dict:
    """Create a new user and return an access token."""
    normalized_email = email.strip().lower()
    if user_repo.get_by_email(db, normalized_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    hashed = hash_password(password)
    user = user_repo.create(db, email=normalized_email, username=username, password_hash=hashed)
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}




def signup_send_otp(db: Session, email: str) -> None:
    """Step 1 / resend — send a signup OTP. Rejects if email is already registered."""
    normalized = email.strip().lower()
    if user_repo.get_by_email(db, normalized):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    now = datetime.now(timezone.utc)
    existing = _signup_otps.get(normalized, {})
    window_start = existing.get("window_start", now)
    if window_start.tzinfo is None:
        window_start = window_start.replace(tzinfo=timezone.utc)
    resend_count = existing.get("resend_count", 0)

    # Reset window if it has expired
    if now - window_start > timedelta(minutes=OTP_RATE_WINDOW_MINUTES):
        window_start = now
        resend_count = 0

    if resend_count >= OTP_RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Please wait 15 minutes.",
        )

    otp = _generate_otp()
    _signup_otps[normalized] = {
        "otp": otp,
        "expires_at": now + timedelta(minutes=OTP_EXPIRY_MINUTES),
        "resend_count": resend_count + 1,
        "window_start": window_start,
    }
    logger.info(f"[SIGNUP] OTP generated | email={normalized} attempt={resend_count + 1}")
    send_otp_email(normalized, otp, purpose="signup")



def signup_verify_otp(email: str, otp: str) -> str:
    """Step 2 — validate OTP and return a short-lived signup_token JWT."""
    normalized = email.strip().lower()
    record = _signup_otps.get(normalized)
    if not record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No OTP found for this email")
    expires_at = record["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        _signup_otps.pop(normalized, None)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")
    if record["otp"].strip() != otp.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
    _signup_otps.pop(normalized, None)
    expire = datetime.now(timezone.utc) + timedelta(minutes=SIGNUP_TOKEN_EXPIRY_MINUTES)
    signup_token = jwt.encode(
        {"sub": normalized, "purpose": "signup", "exp": expire},
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )
    logger.info(f"[SIGNUP] OTP verified, signup_token issued | email={normalized}")
    return signup_token


def signup_complete(db: Session, signup_token: str, username: str, password: str) -> dict:
    """Step 3 — verify signup_token and create the user in one transaction."""
    try:
        payload = jwt.decode(signup_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired signup token")
    if payload.get("purpose") != "signup":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token purpose")
    email = payload.get("sub", "").strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signup token")
    if user_repo.get_by_email(db, email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    hashed = hash_password(password)
    user = user_repo.create(db, email=email, username=username, password_hash=hashed)
    token = create_access_token(subject=user.id)
    logger.info(f"[SIGNUP] User created | user_id={user.id} email={email}")
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}


def login(db: Session, email: str, password: str) -> dict:
    """Verify credentials and return an access token."""
    normalized_email = email.strip().lower()
    user = user_repo.get_by_email(db, normalized_email)
    if not user or not verify_password(password, user._password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}


def google_login(db: Session, credential: str) -> dict:
    """Exchange a Google ID token for a signed-in SetupSpot session."""
    if not credential:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Google credential")

    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google OAuth is not configured")

    try:
        req = Request(
            "https://oauth2.googleapis.com/tokeninfo",
            data=f"id_token={credential}".encode("utf-8"),
            method="POST",
        )
        with urlopen(req, timeout=10) as resp:
            payload = json.load(resp)
    except Exception as exc:  # pragma: no cover - network failure path
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google sign-in failed") from exc

    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account did not return an email")

    user = user_repo.get_by_email(db, email)
    if not user:
        username = (payload.get("name") or email.split("@", 1)[0]).strip()
        user = user_repo.create(
            db,
            email=email,
            username=username,
            password_hash=hash_password("google-oauth-" + email),
        )

    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}


def get_current_user(db: Session, user_id: int) -> User:
    """Resolve a user_id from a JWT to a User row."""
    user = user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def _check_rate_limit(store: dict, key, label: str) -> None:
    """Shared rate-limit check. Raises 429 if over OTP_RATE_LIMIT within OTP_RATE_WINDOW_MINUTES."""
    now = datetime.now(timezone.utc)
    rec = store.get(key, {})
    window_start = rec.get("window_start", now)
    if window_start.tzinfo is None:
        window_start = window_start.replace(tzinfo=timezone.utc)
    count = rec.get("resend_count", 0)
    if now - window_start > timedelta(minutes=OTP_RATE_WINDOW_MINUTES):
        window_start, count = now, 0
    if count >= OTP_RATE_LIMIT:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts. Please wait 15 minutes.")
    store[key] = {"resend_count": count + 1, "window_start": window_start}
    logger.info(f"[{label}] rate-limit count={count + 1} key={key}")


def request_password_reset(db: Session, email: str) -> None:
    """Generate a 6-digit OTP and email it. Always returns 200 to avoid user enumeration."""
    normalized_email = email.strip().lower()
    logger.info(f"[RESET] Request received | email={normalized_email}")
    user = user_repo.get_by_email(db, normalized_email)
    if not user:
        logger.warning(f"[RESET] Email not found in DB | email={email}")
        return
    _check_rate_limit(_reset_rate, normalized_email, "RESET")
    otp = _generate_otp()
    logger.info(f"[RESET] OTP generated | user_id={user.id} email={email}")
    user.reset_token = otp
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)
    user_repo.save(db, user)
    logger.info(f"[RESET] OTP saved to DB | user_id={user.id}")
    send_otp_email(user.email, otp, purpose="reset")


def _is_expired(expires_at: datetime | None) -> bool:
    if expires_at is None:
        return True
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) > expires_at


def reset_password(db: Session, email: str | None = None, otp: str | None = None, new_password: str = "", token: str | None = None) -> None:
    """Validate the OTP or reset token and update the password."""
    clean_token = token.strip() if token else None
    clean_otp = otp.strip() if otp else None

    if clean_token:
        user = user_repo.get_by_reset_token(db, clean_token)
    else:
        normalized_email = email.strip().lower() if email else ""
        user = user_repo.get_by_email(db, normalized_email)

    if not user or user.reset_token is None or _is_expired(user.reset_token_expires):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")

    provided_code = clean_token or clean_otp
    if not provided_code or user.reset_token.strip() != provided_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")

    user._password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    user_repo.save(db, user)


def send_change_password_otp(db: Session, user: User) -> None:
    """Send an OTP to confirm a password change from the profile page."""
    _check_rate_limit(_change_rate, user.id, "CHANGE")
    logger.info(f"[CHANGE] OTP request | user_id={user.id} email={user.email}")
    otp = _generate_otp()
    user.reset_token = otp
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)
    user_repo.save(db, user)
    logger.info(f"[CHANGE] OTP saved to DB | user_id={user.id}")
    send_otp_email(user.email, otp, purpose="change")


def change_password(db: Session, user: User, otp: str, new_password: str) -> None:
    """Validate OTP then update password."""
    clean_otp = otp.strip() if otp else ""
    if not user or user.reset_token is None or _is_expired(user.reset_token_expires):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")
    if not clean_otp or user.reset_token.strip() != clean_otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")
    user._password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    user_repo.save(db, user)
