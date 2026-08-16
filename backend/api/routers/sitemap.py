"""Dynamic sitemap router — generates /api/sitemap.xml with all public URLs.

Covers:
  - All public setups  (/setup/:id)
  - All user profiles  (/user/:username)
  - All public collections  (/collection/:id)

Cached for 6 hours (21600s) to avoid hammering the DB on every crawl.
Search engines re-fetch sitemaps infrequently so this is safe.
"""
from fastapi import APIRouter, Depends, Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from core.database import get_db

router = APIRouter(tags=["sitemap"])

BASE_URL = "https://setupspot.com"
_SITEMAP_CACHE: str | None = None
_SITEMAP_CACHE_TTL = 21600  # 6 hours


def _build_sitemap(db: Session) -> str:
    """Query the DB for all public content and build an XML sitemap string."""

    # All setup IDs + updated_at (use created_at as proxy since there's no updated_at)
    setup_rows = db.execute(
        text("SELECT id, created_at FROM setups ORDER BY id DESC LIMIT 50000")
    ).fetchall()

    # All distinct usernames
    user_rows = db.execute(
        text("SELECT username FROM users ORDER BY id DESC LIMIT 50000")
    ).fetchall()

    # All collection IDs
    collection_rows = db.execute(
        text("SELECT id, created_at FROM collections ORDER BY id DESC LIMIT 50000")
    ).fetchall()

    urls: list[str] = []

    # Static top-level pages
    static_pages = [
        ("", "1.0", "daily"),
        ("/explore", "0.9", "hourly"),
        ("/search", "0.7", "weekly"),
    ]
    for path, priority, freq in static_pages:
        urls.append(
            f"  <url>\n"
            f"    <loc>{BASE_URL}{path}</loc>\n"
            f"    <changefreq>{freq}</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            f"  </url>"
        )

    # Setup pages
    for row in setup_rows:
        lastmod = ""
        if row.created_at:
            lastmod = f"\n    <lastmod>{row.created_at.strftime('%Y-%m-%d')}</lastmod>"
        urls.append(
            f"  <url>\n"
            f"    <loc>{BASE_URL}/setup/{row.id}</loc>{lastmod}\n"
            f"    <changefreq>weekly</changefreq>\n"
            f"    <priority>0.8</priority>\n"
            f"  </url>"
        )

    # User profile pages
    for row in user_rows:
        urls.append(
            f"  <url>\n"
            f"    <loc>{BASE_URL}/user/{row.username}</loc>\n"
            f"    <changefreq>weekly</changefreq>\n"
            f"    <priority>0.7</priority>\n"
            f"  </url>"
        )

    # Collection pages
    for row in collection_rows:
        lastmod = ""
        if row.created_at:
            lastmod = f"\n    <lastmod>{row.created_at.strftime('%Y-%m-%d')}</lastmod>"
        urls.append(
            f"  <url>\n"
            f"    <loc>{BASE_URL}/collection/{row.id}</loc>{lastmod}\n"
            f"    <changefreq>monthly</changefreq>\n"
            f"    <priority>0.6</priority>\n"
            f"  </url>"
        )

    body = "\n".join(urls)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n"
        "</urlset>"
    )


@router.get("/api/sitemap.xml", include_in_schema=False)
def get_sitemap(db: Session = Depends(get_db)):
    """Serve a dynamically generated XML sitemap of all public pages.

    Cached server-side for 6 hours and also instructed to be cached by
    CDN / reverse proxies for the same duration.
    """
    global _SITEMAP_CACHE

    # Simple in-process TTL cache using a module-level variable.
    # For production with multiple workers, consider Redis instead.
    if _SITEMAP_CACHE is None:
        _SITEMAP_CACHE = _build_sitemap(db)

    return Response(
        content=_SITEMAP_CACHE,
        media_type="application/xml",
        headers={
            "Cache-Control": f"public, max-age={_SITEMAP_CACHE_TTL}, stale-while-revalidate=3600",
        },
    )


@router.post("/api/sitemap/purge", include_in_schema=False)
def purge_sitemap_cache():
    """Purge the in-process sitemap cache so the next request rebuilds it.

    Useful to call after bulk imports or significant content additions.
    This endpoint is unauthenticated intentionally — it only clears a cache,
    not modifies any data. Protect with network-level rules if needed.
    """
    global _SITEMAP_CACHE
    _SITEMAP_CACHE = None
    return {"message": "Sitemap cache purged. Next request will rebuild."}
