"""Algolia client — thin wrapper around algoliasearch v4 SDK.

v4 uses SearchClientSync directly; no init_index() pattern.
Same lazy-init singleton pattern as cloudinary_client.py.
"""
from algoliasearch.search.client import SearchClientSync

from core.config import settings

_client: SearchClientSync | None = None


def get_client() -> SearchClientSync:
    """Return the Algolia sync client, initialising it on first call."""
    global _client
    if _client is None:
        _client = SearchClientSync(settings.ALGOLIA_APP_ID, settings.ALGOLIA_WRITE_API_KEY)
    return _client
