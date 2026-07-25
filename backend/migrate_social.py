"""
Migration script: Add likes table, comments table, and avatar_url column to users.
Run this script once against the production NeonDB.
"""
import sys
import os

# Make sure backend modules are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from core.database import engine

SQL_STATEMENTS = [
    # Add avatar_url column to users (idempotent: only if not exists)
    """
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1024);
    """,
    # Create likes table
    """
    CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        setup_id INTEGER NOT NULL REFERENCES setups(id) ON DELETE CASCADE,
        CONSTRAINT uq_like_user_setup UNIQUE (user_id, setup_id)
    );
    """,
    # Create comments table
    """
    CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        body TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        setup_id INTEGER NOT NULL REFERENCES setups(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    """,
]

def run():
    with engine.connect() as conn:
        for stmt in SQL_STATEMENTS:
            print(f"Executing: {stmt.strip()[:60]}...")
            conn.execute(text(stmt))
        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    run()
