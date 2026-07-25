"""
Migration script: Enable pgvector extension and add embedding column to setups table.
Run this script once against Neon DB.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from core.database import engine

SQL_STATEMENTS = [
    # Enable vector extension on Neon DB
    """
    CREATE EXTENSION IF NOT EXISTS vector;
    """,
    # Add 384-dimensional vector column to setups table
    """
    ALTER TABLE setups
    ADD COLUMN IF NOT EXISTS embedding vector(384);
    """,
]

def run():
    with engine.connect() as conn:
        for stmt in SQL_STATEMENTS:
            print(f"Executing: {stmt.strip()[:60]}...")
            conn.execute(text(stmt))
        conn.commit()
    print("Vector migration complete.")

if __name__ == "__main__":
    run()
