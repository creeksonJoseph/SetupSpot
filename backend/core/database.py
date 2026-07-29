"""SQLAlchemy engine and session factory.

This is the ONLY place in the app that creates DB connections.
All other layers receive a session via the get_db() dependency.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from core.config import settings


class Base(DeclarativeBase):
    """Shared declarative base — imported by every model."""
    pass


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # detect stale connections from NeonDB pooler
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_db_schema():
    """Safely verify and auto-add missing columns (e.g. bio) to database tables."""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;"))
            conn.commit()
    except Exception as err:
        print(f"Database schema verification notice: {err}")

