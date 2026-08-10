"""Upstash Redis client — quota-conscious REST API caching wrapper.

Responsibilities:
- Initialize Upstash Redis REST client using UPSTASH_REDIS_REST_URL & TOKEN.
- Expose JSON getter/setter with TTL.
- Provide targeted invalidation helpers.
- Guarantee 100% graceful fallback to DB if Redis is offline/unconfigured.
"""
import json
from typing import Any, Optional, Tuple
from upstash_redis import Redis
from core.config import settings

_redis_client: Optional[Redis] = None


def get_redis_client() -> Optional[Redis]:
    """Lazy initializer for Upstash Redis client."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    url = settings.UPSTASH_REDIS_REST_URL
    token = settings.UPSTASH_REDIS_REST_TOKEN

    if not url or not token:
        return None

    try:
        _redis_client = Redis(url=url, token=token)
        return _redis_client
    except Exception as exc:
        print(f"Failed to initialize Upstash Redis: {exc}")
        return None


def get_json(key: str) -> Optional[Any]:
    """Retrieve and deserialize JSON value from Redis with exception handling."""
    client = get_redis_client()
    if client is None:
        return None

    try:
        raw = client.get(key)
        if raw is None:
            return None
        if isinstance(raw, (dict, list)):
            return raw
        return json.loads(raw)
    except Exception as exc:
        print(f"Redis GET error for key '{key}': {exc}")
        return None


def set_json(key: str, value: Any, ttl_seconds: int = 3600) -> bool:
    """Serialize and store value in Redis with TTL (seconds)."""
    client = get_redis_client()
    if client is None:
        return False

    try:
        serialized = json.dumps(value)
        # Upstash redis set accepts ex for TTL in seconds
        client.set(key, serialized, ex=ttl_seconds)
        return True
    except Exception as exc:
        print(f"Redis SET error for key '{key}': {exc}")
        return False


def delete_key(key: str) -> bool:
    """Delete a key from Redis."""
    client = get_redis_client()
    if client is None:
        return False

    try:
        client.delete(key)
        return True
    except Exception as exc:
        print(f"Redis DELETE error for key '{key}': {exc}")
        return False


# ── Specialized Caching Helpers ──────────────────────────────────────────────

# 1. Vector Similar Recommendations (TTL: 24 hours, page chunked)
def get_cached_similar_setups(setup_id: int, page: int = 1) -> Optional[list]:
    return get_json(f"similar:{setup_id}:page:{page}")


def set_cached_similar_setups(setup_id: int, data: list, page: int = 1, ttl: int = 86400) -> bool:
    return set_json(f"similar:{setup_id}:page:{page}", data, ttl_seconds=ttl)


# 2. Explore Feed Setups (TTL: 10 minutes, invalidated on new setup create/delete)
def get_cached_explore_setups() -> Optional[list]:
    return get_json("explore_setups_feed")


def set_cached_explore_setups(data: list, ttl: int = 600) -> bool:
    return set_json("explore_setups_feed", data, ttl_seconds=ttl)


def invalidate_explore_setups() -> bool:
    return delete_key("explore_setups_feed")


# 3. Setup Detail Payload (TTL: 15 minutes, invalidated on comment/like/delete)
def get_cached_setup_detail(setup_id: int) -> Optional[dict]:
    return get_json(f"setup_detail:{setup_id}")


def set_cached_setup_detail(setup_id: int, data: dict, ttl: int = 900) -> bool:
    return set_json(f"setup_detail:{setup_id}", data, ttl_seconds=ttl)


def invalidate_setup_detail(setup_id: int) -> bool:
    delete_key(f"similar_setups:{setup_id}")
    return delete_key(f"setup_detail:{setup_id}")


# 4. Rate Limiting Helper (OTP / Auth actions)
def check_rate_limit_info(key: str, max_limit: int = 4, window_seconds: int = 900) -> Tuple[bool, int]:
    """
    Check if a rate-limit key has exceeded max_limit within window_seconds.
    Returns (is_allowed: bool, remaining_ttl_seconds: int).
    """
    client = get_redis_client()
    if client is None:
        return True, 0

    try:
        current = client.get(key)
        raw_ttl = client.ttl(key)
        ttl = int(raw_ttl) if raw_ttl is not None and int(raw_ttl) > 0 else window_seconds

        if current is not None:
            count = int(current)
            if count >= max_limit:
                return False, ttl
            client.set(key, count + 1, ex=ttl)
        else:
            client.set(key, 1, ex=window_seconds)
            ttl = window_seconds

        return True, ttl
    except Exception as exc:
        print(f"Redis rate limit error for '{key}': {exc}")
        return True, 0


def check_rate_limit(key: str, max_limit: int = 4, window_seconds: int = 900) -> bool:
    allowed, _ = check_rate_limit_info(key, max_limit=max_limit, window_seconds=window_seconds)
    return allowed


# 5. Persistent OTP Storage Helpers (TTL default: 15 minutes = 900s)
def store_otp(purpose: str, key_identifier: str, otp: str, ttl_seconds: int = 900) -> bool:
    """Store an OTP string in Redis with automatic TTL expiration."""
    return set_json(f"otp:{purpose}:{key_identifier}", {"otp": otp}, ttl_seconds=ttl_seconds)


def get_otp(purpose: str, key_identifier: str) -> Optional[str]:
    """Retrieve an OTP string from Redis. Returns None if missing or expired."""
    data = get_json(f"otp:{purpose}:{key_identifier}")
    if isinstance(data, dict):
        return data.get("otp")
    return None


def delete_otp(purpose: str, key_identifier: str) -> bool:
    """Delete an OTP from Redis after verification."""
    return delete_key(f"otp:{purpose}:{key_identifier}")
