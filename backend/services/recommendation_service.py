"""Recommendation service — vector embeddings using fastembed & pgvector cosine similarity.

Knows about: fastembed, pgvector, transactions.setup_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from fastembed import TextEmbedding

from models.setup import Setup
from transactions import setup_repo, favorite_repo

# Global singleton for FastEmbed model (BAAI/bge-small-en-v1.5, 384 dimensions)
_embedding_model: Optional[TextEmbedding] = None


def get_embedding_model() -> TextEmbedding:
    """Lazy initializer for FastEmbed model."""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _embedding_model


def generate_setup_text(name: str, items: List[dict]) -> str:
    """Build a rich text description of a setup from its name and item list."""
    item_descriptions = []
    for item in items:
        item_name = item.get("name", "")
        item_desc = item.get("description", "")
        if item_desc:
            item_descriptions.append(f"{item_name}: {item_desc}")
        elif item_name:
            item_descriptions.append(item_name)

    items_str = ", ".join(item_descriptions)
    if items_str:
        return f"{name}. Items: {items_str}"
    return name


def generate_embedding(text: str) -> List[float]:
    """Generate a 384-dimensional vector embedding for text using fastembed."""
    model = get_embedding_model()
    # embed() returns a generator of numpy arrays
    vector_gen = model.embed([text])
    vector = list(vector_gen)[0]
    return vector.tolist()


def embed_and_save_setup(db: Session, setup_id: int) -> None:
    """Generate embedding for a setup and store it in Neon DB pgvector column."""
    setup = setup_repo.get_by_id(db, setup_id)
    if not setup:
        return

    items_data = [
        {"name": item.name, "description": item.description}
        for item in setup.items
    ]
    text = generate_setup_text(setup.name, items_data)
    vector = generate_embedding(text)

    setup.embedding = vector
    db.commit()
    db.refresh(setup)


def get_similar_setups(
    db: Session,
    setup_id: int,
    limit: int = 6,
    requesting_user_id: Optional[int] = None,
) -> List[dict]:
    """
    Find semantically similar setups using pgvector cosine distance search.
    Caches recommendations in Upstash Redis (TTL: 24h) to protect DB quota.
    """
    from core import redis_client

    # 1. Check Upstash Redis cache
    cached_raw = redis_client.get_cached_similar_setups(setup_id)
    if cached_raw is not None and isinstance(cached_raw, list):
        # Cache hit! Enrich with isFavorited status if user logged in
        favorited_ids = set()
        if requesting_user_id is not None:
            user_favorites = favorite_repo.get_by_user(db, requesting_user_id)
            favorited_ids = {f.setup_id for f in user_favorites}

        return [
            {
                **s,
                "isFavorited": s.get("id") in favorited_ids if requesting_user_id else s.get("isFavorited", False),
            }
            for s in cached_raw
        ]

    target_setup = setup_repo.get_by_id(db, setup_id)
    if not target_setup:
        return []

    similar_setups: List[Setup] = []

    # 2. Try vector cosine similarity search if embedding exists
    if target_setup.embedding is not None:
        similar_setups = (
            db.query(Setup)
            .filter(Setup.id != setup_id, Setup.embedding.isnot(None))
            .order_by(Setup.embedding.cosine_distance(target_setup.embedding))
            .limit(limit)
            .all()
        )

    # 3. Fallback: if vector query returned fewer than limit setups, fill with recent setups
    if len(similar_setups) < limit:
        existing_ids = {s.id for s in similar_setups}
        existing_ids.add(setup_id)

        fallback_setups = (
            db.query(Setup)
            .filter(~Setup.id.in_(existing_ids))
            .order_by(Setup.id.desc())
            .limit(limit - len(similar_setups))
            .all()
        )
        similar_setups.extend(fallback_setups)

    serialized_setups = [
        {
            "id": s.id,
            "title": s.name,
            "image": s.image_url,
            "author": f"@{s.user.username}",
            "isFavorited": False,
        }
        for s in similar_setups
    ]

    # Save to Upstash Redis cache for 24 hours (86400s)
    redis_client.set_cached_similar_setups(setup_id, serialized_setups, ttl=86400)

    # Enrich with isFavorited status for requesting user
    if requesting_user_id is not None:
        user_favorites = favorite_repo.get_by_user(db, requesting_user_id)
        favorited_ids = {f.setup_id for f in user_favorites}
        for item in serialized_setups:
            item["isFavorited"] = item["id"] in favorited_ids

    return serialized_setups
