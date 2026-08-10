# Integration: Upstash Redis

Upstash Redis is a serverless, REST-based Redis service used by SetupSpot for high-speed caching, sliding-window rate limiting, OTP session tokens, and JWT token revocation blocklists.

---

## 🔌 Connection & Client Wiring

- **Source File**: [`backend/core/redis_client.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/redis_client.py)
- **SDK Class**: `upstash_redis.Redis`
- **Init Logic**: [`get_redis_client()`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/redis_client.py#L14-L24) lazily initializes the singleton client reading `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

```python
from upstash_redis import Redis

client = Redis(
    url=settings.UPSTASH_REDIS_REST_URL,
    token=settings.UPSTASH_REDIS_REST_TOKEN
)
```

---

## 🔑 Environment Variables Required

| Variable Name | Description | Source File Reference |
| :--- | :--- | :--- |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API Endpoint URL | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L21) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Authentication Token | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L22) |

---

## 🔄 Data Flow & Key Namespaces

| Purpose | Redis Key Format | TTL Duration | Helper Function |
| :--- | :--- | :--- | :--- |
| **Explore Feed Cache** | `setups:feed:page1:anon` / `auth` | 600 seconds (10 min) | `get_cached_explore_setups` / `set_cached_explore_setups` |
| **Setup Detail Cache** | `setup_detail:{setup_id}` | 900 seconds (15 min) | `get_cached_setup_detail` / `set_cached_setup_detail` |
| **Similar Setups Cache** | `similar:{setup_id}:page:{page}` | 86400 seconds (24h) | `get_cached_similar_setups` / `set_cached_similar_setups` |
| **Rate Limiting** | `rate_limit:{action}:{key}` | 900 seconds (15 min) | `check_rate_limit(key, max_limit, window_seconds)` |
| **OTP Token Storage** | `otp:{action}:{key}` | 600 seconds (10 min) | `store_otp` / `get_otp` / `delete_otp` |
| **JWT Revocation** | `revoked:{token}` | Natural token TTL | `set_json(f"revoked:{token}", 1, ttl)` |

---

## 🛡️ Failure Behavior & Fallbacks

- **Graceful Degradation**: Every Redis helper function in `redis_client.py` wraps calls inside `try...except Exception as e:` blocks.
- **Fallback**: If Upstash Redis is unreachable or credentials are missing, helper functions return `None` or `False`. The backend automatically falls back to querying PostgreSQL directly without raising an HTTP error.

---

## 💡 Gotchas & Considerations

- **HTTP REST Protocol**: Upstash Redis operates over HTTP REST requests rather than raw TCP sockets. Each command incurs an HTTP round-trip (~20-50ms depending on region).
- **Cache Invalidation**: Mutation endpoints (`POST /setups`, `PUT /setups/{id}`, `DELETE /setups/{id}`, likes, comments) explicitly execute `invalidate_explore_setups()` and `invalidate_setup_detail(setup_id)` to keep caches consistent.
