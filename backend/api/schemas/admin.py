"""Admin and Feedback Pydantic schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

ADMIN_EMAIL = "charanajoseph@gmail.com"


class AdminDashboardStats(BaseModel):
    total_users: int
    total_setups: int
    total_comments: int
    total_collections: int
    total_feedback: int
    recent_users_count_7d: int
    recent_setups_count_7d: int


class AdminUserOut(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    setup_count: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    message: str
    category: Optional[str] = "feature_suggestion"


class FeedbackOut(BaseModel):
    id: int
    user_id: int
    username: str
    user_email: str
    message: str
    category: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
