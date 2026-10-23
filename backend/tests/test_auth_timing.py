import pytest
import time
from core.database import SessionLocal, Base, engine
from transactions import user_repo
from services import auth_service

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_login_timing(db, monkeypatch):
    # Bypass rate limits for test
    monkeypatch.setattr("core.redis_client.check_rate_limit_info", lambda *args, **kwargs: (True, 0))

    email = "timing@example.com"
    existing = user_repo.get_by_email(db, email)
    if existing:
        db.delete(existing)
        db.commit()
    auth_service.register(db, email=email, username="timing", password="RealPassword123!")

    # Time existing user (wrong password)
    start = time.perf_counter()
    try:
        auth_service.login(db, email, "WrongPassword123!")
    except Exception:
        pass
    existing_time = time.perf_counter() - start

    # Time non-existent user
    start = time.perf_counter()
    try:
        auth_service.login(db, "doesnotexist@example.com", "WrongPassword123!")
    except Exception:
        pass
    non_existing_time = time.perf_counter() - start

    # Difference should be minimal (argon2 takes a measurable amount of time, e.g. ~50-100ms)
    diff = abs(existing_time - non_existing_time)
    assert diff < 0.25, f"Timing attack possible. Time diff: {diff}s"
