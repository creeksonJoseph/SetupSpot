"""Pydantic schemas for setup requests and responses."""
from pydantic import BaseModel


class AnnotatedItemOut(BaseModel):
    id: int
    name: str
    price: float
    link: str | None
    description: str | None
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
    name: str
    image_url: str | None
    user_id: int
    items: list[AnnotatedItemOut]
