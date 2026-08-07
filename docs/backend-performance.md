# Backend System Design & Database Architecture

This document details the backend architectural patterns, database indexing strategies, asynchronous background processing, and payload caching layers implemented in **SetupSpot** (`backend/`).

---

## 1. Database Indexing Strategy

### Overview
Without explicit indexes, PostgreSQL performs full sequential table scans for foreign key filters, user profile lookups, and chronological sorting.

### Applied Indexes (Alembic Migration [`b7f2a1c9e3d0`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/database/migrations/versions/b7f2a1c9e3d0_add_performance_indexes.py))

A total of 14 B-Tree indexes were created across primary core tables:

| Table | Index Name | Columns | Target Query |
|---|---|---|---|
| `setups` | `ix_setups_user_id` | `user_id` | User profile setups query (`WHERE user_id = ?`) |
| `setups` | `ix_setups_created_at` | `created_at` | Explore feed default sorting (`ORDER BY created_at DESC`) |
| `items` | `ix_items_setup_id` | `setup_id` | Setup items detail fetch (`WHERE setup_id = ?`) |
| `items` | `ix_items_user_id` | `user_id` | User items fetch |
| `likes` | `ix_likes_setup_id` | `setup_id` | Aggregate like count (`COUNT(likes) WHERE setup_id = ?`) |
| `likes` | `ix_likes_user_id` | `user_id` | User likes lookup |
| `likes` | `ix_likes_user_id_setup_id` | `(user_id, setup_id)` | Unique composite seek for `is_liked` status |
| `comments` | `ix_comments_setup_id` | `setup_id` | Comments listing per setup |
| `comments` | `ix_comments_user_id` | `user_id` | User comments & permission checks |
| `comments` | `ix_comments_created_at` | `created_at` | Chronological comment ordering |
| `favorites` | `ix_favorites_user_id` | `user_id` | User favorites listing |
| `favorites` | `ix_favorites_setup_id` | `setup_id` | Favorited count lookups |
| `favorites` | `ix_favorites_user_id_setup_id` | `(user_id, setup_id)` | Composite seek for `isFavorited` status |

---

## 2. N+1 Query Elimination & Eager Loading

### The Problem
In the setup list serializer, accessing `setup.user.username` inside a loop triggered an additional `SELECT * FROM users WHERE id = ?` for every setup in the feed ($N+1$ queries).

### The Solution ([`setup_repo.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/transactions/setup_repo.py))
SQLAlchemy query options were configured to eagerly fetch relationships in optimized batches:

```python
def get_page(db: Session, cursor: int | None = None, limit: int = 48) -> list[Setup]:
    q = (
        db.query(Setup)
        .options(
            joinedload(Setup.user),        # Single SQL JOIN for author details
            selectinload(Setup.likes),     # Single IN (...) batch query for likes
            selectinload(Setup.favorites), # Single IN (...) batch query for favorites
        )
        .order_by(Setup.created_at.desc(), Setup.id.desc())
    )
    if cursor is not None:
        q = q.filter(Setup.id < cursor)
    return q.limit(limit).all()
```

### Scalar Count Subqueries ([`setup_service.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/services/setup_service.py))
Instead of executing `len(setup.likes)` (which loads all ORM objects into python memory), we issue scalar SQL subqueries:

```python
like_count = db.query(func.count(Like.id)).filter(Like.setup_id == setup.id).scalar() or 0
```

---

## 3. Asynchronous Non-Blocking Background Tasks

### Architecture
When creating a setup (`POST /setups`), search indexing via Algolia and vector embedding generation via `fastembed` (384-dimensional `BAAI/bge-small-en-v1.5` model) are expensive operations. Running them synchronously blocked the HTTP response for up to 3 seconds.

### Implementation ([`setups.py` Router](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/api/routers/setups.py))
We offloaded indexing and embedding to FastAPI `BackgroundTasks`:

```
Client POST /setups ──► Save DB & Commit ──► HTTP 201 Created (Instant ~100ms)
                                                  │
                                                  ├─► [Background] Algolia Search Sync
                                                  └─► [Background] FastEmbed Vector Generation
```

```python
@router.post("", response_model=SetupDetailOut, status_code=201)
def create_setup(
    background_tasks: BackgroundTasks,
    data: str = Form(...),
    ...
):
    # 1. Immediate DB persistence
    setup = setup_service.create_setup(...)

    # 2. Queue background jobs (executes after 201 response is dispatched)
    background_tasks.add_task(
        setup_service.background_index_setup,
        setup_id=setup.id,
        db_url=settings.DATABASE_URL,
    )

    return setup_service.serialize_setup_detail(setup, requesting_user_id=current_user.id, db=db)
```

---

## 4. Keyset / Cursor-Based Pagination

### Traditional `OFFSET` Degradation
Traditional pagination (`OFFSET 1000 LIMIT 48`) requires the database engine to scan and discard 1,000 rows before returning 48. As offset grows, latency increases linearly ($O(N)$).

### Keyset Cursor Implementation ([`setup_repo.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/transactions/setup_repo.py))
We implemented keyset pagination using the setup ID:

```sql
SELECT * FROM setups 
WHERE id < :cursor 
ORDER BY created_at DESC, id DESC 
LIMIT 48;
```

Because an index exists on `(id)`, this operation executes as a $O(\log N)$ index seek, maintaining constant execution time (<5ms) regardless of scroll depth.

---

## 5. Network Payload Optimizations (GZip, ETags & Cache-Control)

### 1. Response Compression ([`main.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/main.py))
FastAPI `GZipMiddleware` compresses any response payload $\ge 500$ bytes:

```python
app.add_middleware(GZipMiddleware, minimum_size=500)
```
- **Impact**: Reduces JSON payload size by **60%–80%** (e.g. 50KB JSON feed compressed to ~10KB).

### 2. HTTP Cache-Control & ETag Support ([`setups.py` Router](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/api/routers/setups.py))
- **`Cache-Control`**: Public responses carry `public, max-age=60, stale-while-revalidate=300` headers. Edge CDNs (Cloudflare/Render) serve repeat requests directly without reaching origin.
- **`ETag` (MD5 Validation)**: Each response generates a hash of the content:

```python
def _etag_headers(response: Response, data: list | dict, public: bool, max_age: int, swr: int):
    payload_bytes = json.dumps(data, default=str).encode()
    etag = f'"{md5(payload_bytes).hexdigest()}"'
    response.headers["ETag"] = etag
    ...
```

If the client passes a matching `If-None-Match: "etag_hash"`, the server short-circuits and returns `HTTP 304 Not Modified` with an **empty body** (0 bytes transferred).
