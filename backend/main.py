"""FastAPI application entry point.

Responsibilities:
- Create the FastAPI app instance
- Register middleware (CORS)
- Register all routers
- Call Cloudinary init on startup
"""
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from core.config import settings
from core.cloudinary_client import init_cloudinary
from core.database import ensure_db_schema
from api.routers import auth, setups, collections, favorites, users
from api.routers import likes, comments, mobile_upload, early_upload, admin, feedback

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



ALLOWED_ORIGINS = set(cors_origins)


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc: HTTPException):
    origin = request.headers.get("origin", "")
    allow_origin = origin if origin in ALLOWED_ORIGINS else cors_origins[0]
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


@app.exception_handler(Exception)
async def custom_general_exception_handler(request, exc: Exception):
    origin = request.headers.get("origin", "")
    allow_origin = origin if origin in ALLOWED_ORIGINS else cors_origins[0]
    print(f"Unhandled Server Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
        headers={
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


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
