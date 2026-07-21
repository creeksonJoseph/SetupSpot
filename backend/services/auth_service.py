import random
import string
import logging
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from core.config import settings
from core.email import send_otp_email
from core.security import create_access_token
from models.user import User
from transactions import user_repo

_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
OTP_EXPIRY_MINUTES = 15
logger = logging.getLogger(__name__)


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


def get_current_user(db: Session, user_id: int) -> User:
    """Resolve a user_id from a JWT to a User row."""
    user = user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def request_password_reset(db: Session, email: str) -> None:
    """Generate a 6-digit OTP and email it. Always returns 200 to avoid user enumeration."""
    normalized_email = email.strip().lower()
    logger.info(f"[RESET] Request received | email={normalized_email}")
    user = user_repo.get_by_email(db, normalized_email)
    if not user:
        logger.warning(f"[RESET] Email not found in DB | email={email}")
        return
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
