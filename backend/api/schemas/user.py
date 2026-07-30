"""Pydantic schemas for user responses."""
from typing import List, Optional
from pydantic import BaseModel


class UserSetupOut(BaseModel):
    id: int
    title: str
    image: str | None


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    bio: str | None = None
    avatar_url: str | None = None
    post_count: int = 0
    setups: list[UserSetupOut] = []


class UpdateProfileRequest(BaseModel):
    username: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


# ── Public profile schemas (no email, no favorites) ───────────────────────────

class PublicCollectionOut(BaseModel):
    id: int
    name: str
    item_count: int = 0
    cover_images: List[str] = []

    class Config:
        from_attributes = True


class PublicUserOut(BaseModel):
    id: int
    username: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    post_count: int = 0
    collection_count: int = 0
    setups: List[UserSetupOut] = []
    collections: List[PublicCollectionOut] = []


