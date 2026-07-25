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
from fastapi.responses import HTMLResponse, JSONResponse

from core.config import settings
from core.cloudinary_client import init_cloudinary
from api.routers import auth, setups, collections, favorites, users
from api.routers import likes, comments

# ── Init external services ────────────────────────────────────────────────────
init_cloudinary()

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
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
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

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(setups.router)
app.include_router(collections.router)
app.include_router(favorites.router)
app.include_router(users.router)
app.include_router(likes.router)
app.include_router(comments.router)


@app.get("/", include_in_schema=False)
def root():
    index_html_path = Path(__file__).resolve().parent / "index.html"
    if index_html_path.exists():
        return HTMLResponse(index_html_path.read_text(encoding="utf-8"))
    return JSONResponse({"status": "ok", "message": "Backend is running"}, status_code=200)


@app.get("/health")
def health():
    return {"status": "ok"}
