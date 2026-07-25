"""Pydantic schemas for comment requests and responses."""
from datetime import datetime

from pydantic import BaseModel


class CommentIn(BaseModel):
    body: str


class CommentOut(BaseModel):
    id: int
    body: str
    author: str
    author_avatar: str | None
    created_at: datetime

    class Config:
        from_attributes = True
