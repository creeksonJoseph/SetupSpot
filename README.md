# SetupSpot

SetupSpot is a full-stack, Pinterest-style platform for sharing workspace setups with interactive shoppable product hotspots, AI-driven semantic similarity recommendations, instant search, and real-time mobile uploads.

- **Frontend**: React 19, Vite, Tailwind CSS v4 ([`frontend/`](frontend/))
- **Backend**: FastAPI, Python 3.13 (`uv`), PostgreSQL + `pgvector`, Upstash Redis, Sentry ([`backend/`](backend/))

---

## Documentation

Full developer documentation is located in the [`docs/`](docs/) directory:
- [Developer Guide & Architecture Overview](docs/README.md)
- [Getting Started & Local Setup](docs/getting-started.md)
- [Error Handling & Sentry Monitoring](docs/error-handling.md)
- [Security Architecture](docs/security.md)
- [Integrations Directory](docs/integrations/)

---

## Quick Start (Backend)

```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn main:app --reload --port 8000
```

Verify Sentry and Error Pipeline:
```bash
uv run pytest tests/test_error_handling_sentry.py -v
```
