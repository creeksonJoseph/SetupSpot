"""Pydantic schemas for collection requests and responses."""
from pydantic import BaseModel


class CollectionCreateRequest(BaseModel):
    name: str


class CollectionUpdateRequest(BaseModel):
    name: str


class CollectionOut(BaseModel):
    id: int
    name: str
    user_id: int

    class Config:
        from_attributes = True
