"""Pydantic schemas for user responses."""
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

