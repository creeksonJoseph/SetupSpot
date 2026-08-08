"""Pydantic schemas for comment requests and responses."""
from datetime import datetime

from pydantic import BaseModel


class CommentIn(BaseModel):
    body: str
    parent_id: int | None = None


class CommentOut(BaseModel):
    id: int
    body: str
    author: str
    author_avatar: str | None
    parent_id: int | None = None
    like_count: int = 0
    is_liked: bool = False
    reply_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class CommentLikeOut(BaseModel):
    id: int
    is_liked: bool
    like_count: int
