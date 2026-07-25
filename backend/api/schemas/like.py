"""Pydantic schemas for like requests and responses."""
from pydantic import BaseModel


class LikeRequest(BaseModel):
    setup_id: int


class LikeOut(BaseModel):
    id: int
    user_id: int
    setup_id: int

    class Config:
        from_attributes = True


class LikeToggleOut(BaseModel):
    liked: bool
    like_count: int
