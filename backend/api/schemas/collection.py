"""Pydantic schemas for collection requests and responses."""
from typing import Optional, List
from pydantic import BaseModel, Field


class CollectionCreateRequest(BaseModel):
    name: str = Field(..., max_length=100)


class CollectionUpdateRequest(BaseModel):
    name: str = Field(..., max_length=100)


class AddItemToCollectionRequest(BaseModel):
    item_id: int


class CollectionItemOut(BaseModel):
    id: int
    name: str = Field(..., max_length=100)
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
    name: str = Field(..., max_length=100)
    user_id: int
    author_username: Optional[str] = None
    item_count: int = 0
    cover_images: List[str] = []
    items: List[CollectionItemOut] = []
    already_added: Optional[bool] = False


    class Config:
        from_attributes = True

