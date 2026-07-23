"""One-time script to push all existing DB setups to the Algolia index.

Run from the backend/ directory:
    python scripts/backfill_algolia.py
"""
import sys
import os

# Make sure the backend package root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal  # noqa: E402
from services import algolia_service    # noqa: E402


def main() -> None:
    db = SessionLocal()
    try:
        count = algolia_service.backfill_all(db)
        print(f"✅  Backfill complete — {count} record(s) pushed to Algolia.")
    except Exception as exc:
        print(f"❌  Backfill failed: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
