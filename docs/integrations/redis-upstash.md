# Integration: Upstash Redis (REST API)

Upstash Redis provides ultra-fast server-side feed caching, token revocation checking, and rate-limiting across SetupSpot's stateless server deployment.

---

## Connection & Client Wiring

- **Module**: [`backend/core/redis_client.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/redis_client.py)
- **SDK**: `upstash-redis` (`Redis` REST client)
- **Initialization**:
  ```python
  from upstash_redis import Redis
  from core.config import settings

  def get_redis_client() -> Optional[Redis]:
      if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
          return Redis(
              url=settings.UPSTASH_REDIS_REST_URL,
              token=settings.UPSTASH_REDIS_REST_TOKEN
          )
      return None
  ```

---

## Environment Variables Required

Configure in `backend/.env`:

```ini
UPSTASH_REDIS_REST_URL=https://your-database-id.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=
```

---

## Data Flow & Key Namespaces

| Cache Key Pattern | TTL / Expiration | Responsibilities & Invalidation Trigger |
| :--- | :--- | :--- |
| `explore_setups_feed` | 10 Minutes (`600s`) | Cached JSON list of explore feed setups. Invalidated when any user posts a new setup or deletes a setup. |
| `setup_detail:{id}` | 15 Minutes (`900s`) | Full payload for setup detail page. Invalidated on new comment, like toggle, item update, or deletion. |
| `similar_setups:{id}` | 15 Minutes (`900s`) | Similar setups recommendation list payload. |
| `revoked:{token}` | Remaining JWT TTL | Token blocklist entry created on `POST /auth/logout`. Checked on every authenticated request. |
| `otp:{purpose}:{email/id}` | 15 Minutes (`900s`) | Signup, reset, or change password 6-digit OTP code storage. Deleted immediately upon successful verification. |
| `rate_limit:{label}:{key}` | 15 Minutes (`900s`) | Sliding window counter for rate limiting OTP requests and login attempts. |

---

## Failure Behavior & Fallbacks

- **Graceful Fallback**: If Redis credentials are missing, network requests fail, or Upstash service is offline, `redis_client` functions catch exceptions, log a warning, and return `None` or `True`.
- **Database Fallback**: Endpoints automatically fall back to querying Neon PostgreSQL directly with zero application crashes.

---

## Gotchas & Considerations

- **REST Protocol Overhead**: Upstash Redis uses HTTP REST API calls under the hood rather than standard TCP sockets. This allows serverless/stateless invocation without managing connection pools, but introduces ~20-50ms REST latency per call. Avoid making sequential Redis calls in loops; batch operations where possible.
