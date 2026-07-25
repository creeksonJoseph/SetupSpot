"""
Test script: Verify Upstash Redis REST API connection and caching layer.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core import redis_client

def test_redis():
    print("Testing Upstash Redis connection...")
    client = redis_client.get_redis_client()
    if not client:
        print("ERROR: Upstash Redis client failed to initialize.")
        return

    # Test SET and GET
    test_key = "test_upstash_key"
    test_val = {"status": "ok", "message": "Upstash Redis caching working!"}

    print(f"Setting test key '{test_key}' with 60s TTL...")
    success = redis_client.set_json(test_key, test_val, ttl_seconds=60)
    print(f"SET result: {success}")

    print(f"Getting test key '{test_key}'...")
    retrieved = redis_client.get_json(test_key)
    print(f"GET result: {retrieved}")

    assert retrieved == test_val, "Retrieved value does not match original!"

    print("Deleting test key...")
    redis_client.delete_key(test_key)
    print("Test passed successfully! Upstash Redis caching layer is operational.")

if __name__ == "__main__":
    test_redis()
