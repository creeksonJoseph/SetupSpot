"""Pydantic schemas for collection requests and responses."""
from typing import Optional, List
from pydantic import BaseModel


class CollectionCreateRequest(BaseModel):
    name: str


class CollectionUpdateRequest(BaseModel):
    name: str


class AddItemToCollectionRequest(BaseModel):
    item_id: int


class CollectionItemOut(BaseModel):
    id: int
    name: str
    price: float
    link: Optional[str] = None
    description: Optional[str] = None
    setup_id: int
    setup_title: Optional[str] = None
    setup_image_url: Optional[str] = None
    author_username: Optional[str] = None
    # Pre-computed: total items in the parent setup (for "View all N items" button logic)
    setup_total_items: int = 0

    class Config:
        from_attributes = True


class CollectionOut(BaseModel):
    id: int
    name: str
    user_id: int
    author_username: Optional[str] = None
    item_count: int = 0
    cover_images: List[str] = []
    items: List[CollectionItemOut] = []

    class Config:
        from_attributes = True

