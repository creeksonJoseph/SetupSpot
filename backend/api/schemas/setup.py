"""Pydantic schemas for setup requests and responses."""
from pydantic import BaseModel, Field


class AnnotatedItemOut(BaseModel):
    id: int
    name: str = Field(..., max_length=100)
    price: float
    link: str | None
    description: str | None
    item_image_url: str | None
    x: float | None
    y: float | None


class SetupListItemOut(BaseModel):
    """Shape returned by GET /setups (explore page)."""
    id: int
    title: str
    image: str | None
    author: str
    isFavorited: bool


class SetupDetailOut(BaseModel):
    """Shape returned by GET /setups/{id}."""
    id: int
    name: str = Field(..., max_length=100)
    image_url: str | None
    user_id: int
    author_username: str
    author_avatar: str | None
    like_count: int
    is_liked: bool
    comment_count: int
    items: list[AnnotatedItemOut]


class ItemCreateIn(BaseModel):
    name: str = Field(..., max_length=100)
    price: float | str | None = None
    link: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=2000)
    x: float | None = None
    y: float | None = None


class SetupUpdateIn(BaseModel):
    setup_name: str = Field(..., max_length=100)
    items: list[ItemCreateIn] = []

