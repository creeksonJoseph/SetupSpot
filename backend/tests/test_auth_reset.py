import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services import auth_service
from core.database import SessionLocal
from transactions import user_repo


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def _clear_user(db, email: str) -> None:
    user = user_repo.get_by_email(db, email)
    if user is not None:
        db.delete(user)
        db.commit()


def test_reset_password_updates_hash_and_allows_login(monkeypatch, db):
    monkeypatch.setattr(auth_service, 'send_otp_email', lambda *args, **kwargs: None)
    email = 'reset.test@example.com'
    _clear_user(db, email)

    auth_service.register(db, email=email, username='resetuser', password='oldpass123')
    auth_service.request_password_reset(db, email=email)

    user = user_repo.get_by_email(db, email)
    assert user is not None
    assert user.reset_token is not None

    auth_service.reset_password(db, email=email, otp=user.reset_token, new_password='newpass456')

    updated_user = user_repo.get_by_email(db, email)
    assert updated_user is not None
    assert auth_service.verify_password('newpass456', updated_user._password_hash)
    assert not auth_service.verify_password('oldpass123', updated_user._password_hash)

    login_result = auth_service.login(db, email=email, password='newpass456')
    assert login_result['user_id'] == updated_user.id
