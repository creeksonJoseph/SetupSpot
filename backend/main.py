"""FastAPI application entry point.

Responsibilities:
- Create the FastAPI app instance
- Register middleware (CORS)
- Register all routers
- Call Cloudinary init on startup
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse

from core.config import settings
from core.sentry import init_sentry
from core.errors import register_exception_handlers
from core.cloudinary_client import init_cloudinary
from core.database import ensure_db_schema
from api.routers import auth, setups, collections, favorites, users
from api.routers import likes, comments, mobile_upload, early_upload, admin, feedback, sitemap

# ── Early Sentry Initialization ───────────────────────────────────────────────
# Must be executed before the FastAPI application instance is created.
init_sentry()

# ── Init external services & DB schema checks ────────────────────────────────
init_cloudinary()
ensure_db_schema()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SetupSpot API",
    description="Backend API for the SetupSpot desk-setup sharing platform",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
cors_origins = [
    "https://setupspot.tech",
    "http://setupspot.tech",
    "https://www.setupspot.tech",
    "http://www.setupspot.tech",
    "https://api.setupspot.tech",
]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in cors_origins:
    cors_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression — automatically compresses responses ≥ 500 bytes (60-80% size reduction).
# Free win: browsers and HTTP clients all support gzip natively.
app.add_middleware(GZipMiddleware, minimum_size=500)

# ── Production Error & Exception Handling ─────────────────────────────────────
register_exception_handlers(app, cors_origins)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(setups.router)
app.include_router(collections.router)
app.include_router(favorites.router)
app.include_router(users.router)
app.include_router(likes.router)
app.include_router(comments.router)
app.include_router(mobile_upload.router)
app.include_router(early_upload.router)
app.include_router(admin.router)
app.include_router(feedback.router)
app.include_router(sitemap.router)


# ── Verification Route ────────────────────────────────────────────────────────
@app.get("/api/sentry-debug", tags=["Debug"], summary="Trigger Sentry test error")
@app.get("/sentry-debug", include_in_schema=False)
async def trigger_sentry_debug():
    """Trigger a simulated division-by-zero error to verify Sentry capture and 500 handling."""
    division_by_zero = 1 / 0
    return {"result": division_by_zero}


DEFAULT_INDEX_HTML = """<!doctype html>
<html lang="en">
  <head>
    <meta name="google-site-verification" content="3M4KtstYqcaQZpp85WyDBq_hptNcZrSufcxKNGv9E_g"/>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SetupSpot API</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f3f4f6;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --accent: #5a27f1;
      }
      * { box-sizing: border-box; }
      body {
        font-family: Inter, "Segoe UI", sans-serif;
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #f8fafc 0%, var(--bg) 100%);
        color: var(--text);
      }
      .card {
        width: min(92vw, 480px);
        background: var(--card);
        padding: 2.25rem;
        border-radius: 1.25rem;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
        text-align: center;
      }
      .badge {
        display: inline-block;
        margin-bottom: 0.8rem;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        background: rgba(90, 39, 241, 0.1);
        color: var(--accent);
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      h1 { margin: 0 0 0.75rem; font-size: clamp(1.8rem, 4vw, 2.4rem); }
      p { margin: 0; color: var(--muted); line-height: 1.6; }
    </style>
  </head>
  <body>
    <main class="card">
      <span class="badge">Backend Running</span>
      <h1>SetupSpot API</h1>
      <p>
        The server is up and ready. Use the API endpoints for auth, setups,
        collections, favorites, and users.
      </p>
    </main>
  </body>
</html>"""


@app.get("/", include_in_schema=False)
def root():
    candidate_paths = [
        Path(__file__).resolve().parent / "index.html",
        Path.cwd() / "index.html",
        Path.cwd() / "backend" / "index.html",
    ]
    for p in candidate_paths:
        if p.exists():
            return HTMLResponse(p.read_text(encoding="utf-8"))

    return HTMLResponse(DEFAULT_INDEX_HTML)


@app.get("/health")
def health():
    return {"status": "ok"}
