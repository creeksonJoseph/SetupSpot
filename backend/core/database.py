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
    """Safely verify, create missing tables, add columns, and promote charanajoseph@gmail.com to admin."""
    from sqlalchemy import text
    import models  # Ensure all models are registered

    try:
        # Create all tables (e.g. feedback) if they do not exist
        Base.metadata.create_all(bind=engine)

        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();"))
            # Promote charanajoseph@gmail.com to admin in database
            conn.execute(text("UPDATE users SET is_admin = TRUE WHERE LOWER(email) = 'charanajoseph@gmail.com';"))
            conn.commit()
            print("Successfully verified DB schema & promoted charanajoseph@gmail.com to admin.")
    except Exception as err:
        print(f"Database schema verification notice: {err}")


