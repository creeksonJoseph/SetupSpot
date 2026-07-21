"""FastAPI application entry point.

Responsibilities:
- Create the FastAPI app instance
- Register middleware (CORS)
- Register all routers
- Call Cloudinary init on startup
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.cloudinary_client import init_cloudinary
from api.routers import auth, setups, collections, favorites, users

# ── Init external services ────────────────────────────────────────────────────
init_cloudinary()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SetupSpot API",
    description="Backend API for the SetupSpot desk-setup sharing platform",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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


@app.get("/health")
def health():
    return {"status": "ok"}
