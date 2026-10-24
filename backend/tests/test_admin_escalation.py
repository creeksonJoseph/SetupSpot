import pytest
from core.database import SessionLocal
from transactions import user_repo
from services import user_service
from models.user import User

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_admin_escalation_via_email(db):
    email = "charanajoseph@gmail.com"
    existing = user_repo.get_by_email(db, email)
    if existing:
        db.delete(existing)
        db.commit()

    user = user_repo.create(db, email=email, username="test_hacker", password_hash="hash")

    profile = user_service.get_user_profile(user)
    assert profile.is_admin == False, "Vulnerability fixed: admin escalation no longer works"
