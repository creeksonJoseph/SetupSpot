"""Algolia index service — all read/write operations against the Algolia setups index.

Uses algoliasearch v4 SDK (SearchClientSync).
Knows about: core.algolia_client, models.Setup
Does NOT know about: HTTP, FastAPI, request objects.
"""
import logging

from sqlalchemy.orm import Session

from core.algolia_client import get_client
from core.config import settings
from models.setup import Setup

logger = logging.getLogger(__name__)


def _build_record(setup: Setup) -> dict:
    """Build an Algolia record from a Setup ORM object."""
    item_names = [item.name for item in (setup.items or [])]
    item_descriptions = [item.description for item in (setup.items or []) if item.description]
    author_name = setup.user.username if setup.user else ""

    return {
        "objectID": str(setup.id),
        "name": setup.name,
        "author": author_name,
        "username": author_name,
        "image_url": setup.image_url or "",
        "items": item_names,
        "item_descriptions": item_descriptions,
        # _tags enables searching by item name or username without extra Algolia config
        "_tags": item_names + [author_name, f"@{author_name}"],
    }


def index_user(user) -> None:
    """Upsert a user record into the Algolia index upon creation so users are searchable by username."""
    try:
        client = get_client()
        username = getattr(user, "username", "")
        record = {
            "objectID": f"user_{getattr(user, 'id', 0)}",
            "name": f"@{username}",
            "author": username,
            "username": username,
            "image_url": getattr(user, "avatar_url", "") or "",
            "items": [],
            "item_descriptions": [],
            "_tags": [username, f"@{username}"],
        }
        client.save_object(index_name=settings.ALGOLIA_INDEX_NAME, body=record)
        logger.info("Algolia: indexed user %s (@%s)", getattr(user, "id", 0), username)
    except Exception as exc:
        logger.error("Algolia: failed to index user — %s", exc)


def index_setup(setup: Setup) -> None:
    """Upsert a single setup into the Algolia index. Silently logs on error."""
    try:
        client = get_client()
        record = _build_record(setup)
        client.save_object(index_name=settings.ALGOLIA_INDEX_NAME, body=record)
        logger.info("Algolia: indexed setup %s", setup.id)
    except Exception as exc:
        # Never let Algolia failures surface as HTTP errors to the user
        logger.error("Algolia: failed to index setup %s — %s", setup.id, exc)


def delete_setup(setup_id: int) -> None:
    """Remove a setup from the Algolia index. Silently logs on error."""
    try:
        client = get_client()
        client.delete_object(index_name=settings.ALGOLIA_INDEX_NAME, object_id=str(setup_id))
        logger.info("Algolia: deleted setup %s", setup_id)
    except Exception as exc:
        logger.error("Algolia: failed to delete setup %s — %s", setup_id, exc)


def backfill_all(db: Session) -> int:
    """Push every setup in the DB to Algolia. Returns the count of indexed records."""
    from transactions import setup_repo  # local import to avoid circular deps

    setups = setup_repo.get_all(db)
    records = []
    for setup in setups:
        try:
            records.append(_build_record(setup))
        except Exception as exc:
            logger.warning("Algolia backfill: skipping setup %s — %s", setup.id, exc)

    if records:
        client = get_client()
        client.save_objects(index_name=settings.ALGOLIA_INDEX_NAME, objects=records)
        logger.info("Algolia: backfilled %d records", len(records))

    return len(records)
