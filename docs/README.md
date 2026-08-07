# SetupSpot System Architecture & Performance Optimizations

This directory documents the comprehensive system design and performance optimization overhaul implemented across the **SetupSpot** web application.

---

## 🏛️ System Design & Architecture Overview

SetupSpot uses a modern full-stack decoupled architecture designed for high throughput, low latency, and instantaneous user perception of speed.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                    Client / Frontend                    │
                  │  - React 19 + Vite (Manual Chunking)                    │
                  │  - Progressive Rendering (<Suspense> + Skeletons)       │
                  │  - In-Memory SWR Cache + ETag 304 Validation            │
                  │  - CSS `content-visibility: auto` Off-screen Skipping    │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                                       HTTP / REST API
                                               │
                  ┌────────────────────────────▼────────────────────────────┐
                  │                    FastAPI Backend                      │
                  │  - GZip Compression Middleware (min 500B)               │
                  │  - Cache-Control & MD5 ETag Headers                      │
                  │  - Non-blocking Background Tasks (Algolia + pgvector)   │
                  └──────┬─────────────────────┬─────────────────────┬──────┘
                         │                     │                     │
      ┌──────────────────▼──┐        ┌─────────▼─────────┐  ┌────────▼─────────┐
      │   Neon Postgres DB  │        │   Upstash Redis   │  │   Cloudinary API│
      │  - 14 Indexes       │        │  - Feed / Detail  │  │  - Direct / Early│
      │  - Joined Eager Load│        │    Cache Layer    │  │    Image Upload │
      │  - Cursor Pagination│        │  - Rate Limiting  │  └─────────────────┘
      └─────────────────────┘        └───────────────────┘
```

---

## 📚 Optimization Documentation Index

| Topic | Description | Documentation |
|---|---|---|
| **Frontend Architecture** | Progressive rendering, Suspense boundaries, skeleton screens, in-memory SWR caching, CSS containment (`content-visibility`), manual vendor chunk splitting. | [`frontend-performance.md`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/docs/frontend-performance.md) |
| **Backend & Database** | 14 B-Tree DB indexes, N+1 query elimination (`joinedload`/`selectinload`), asynchronous background tasks for search indexing and vector embeddings, keyset cursor-based pagination, HTTP ETags, GZip payload compression. | [`backend-performance.md`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/docs/backend-performance.md) |

---

## ⚡ Summary of Impact & Metric Improvements

| Metric / Dimension | Before Optimization | After Optimization | Key Mechanism |
|---|---|---|---|
| **Post Creation Latency** | ~1.5s – 3.5s (blocking embedding & search sync) | **~100ms - 150ms** | FastAPI `BackgroundTasks` offloading Algolia + `fastembed` |
| **Revisiting Explore Page** | Skeleton flash + 300ms API fetch | **0ms Instant render** | `useDataCache` (SWR) + ETag 304 Not Modified |
| **Deep Scroll DB Query Cost** | `O(N)` scan with `OFFSET` | **`O(log N)` index seek** | Keyset / Cursor Pagination (`WHERE id < cursor`) |
| **Database Query Volume** | `N+1` queries (1 query per setup for author/likes) | **1 JOIN query** | SQLAlchemy `joinedload` & `selectinload` |
| **JSON Network Payload** | Raw uncompressed text (~50KB feed) | **~10KB (80% smaller)** | `GZipMiddleware` + Slim Pydantic serializers |
| **Off-screen DOM Render Cost** | Browser paints all cards on mount | **Layout/Paint skipped** | CSS `content-visibility: auto` + `contain-intrinsic-size` |
