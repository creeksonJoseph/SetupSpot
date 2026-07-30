"""Pydantic schemas for favorite requests and responses."""
from pydantic import BaseModel


class FavoriteRequest(BaseModel):
    setup_id: int


class FavoriteOut(BaseModel):
    id: int
    user_id: int
    setup_id: int
    already_favorited: bool = False

    class Config:
        from_attributes = True



class FavoriteSetupOut(BaseModel):
    """Shape for favorited setup items (used by GET /favorites/list)."""
    id: int
    title: str
    image: str | None
    author: str
