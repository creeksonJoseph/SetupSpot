"""
Backfill script: Compute and store FastEmbed vector embeddings for all existing setups in Neon DB.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.setup import Setup
from services import recommendation_service

def run():
    db = SessionLocal()
    try:
        all_setups = db.query(Setup).all()
        print(f"Found {len(all_setups)} setups to process...")
        for s in all_setups:
            print(f"Embedding setup {s.id}: '{s.name}'...")
            recommendation_service.embed_and_save_setup(db, s.id)
        print("Backfill completed successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    run()
