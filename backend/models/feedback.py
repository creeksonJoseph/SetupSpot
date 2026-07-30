"""Feedback ORM model — user feature suggestions and bug reports."""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from core.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="feature_suggestion", nullable=False)
    status = Column(String(50), default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user = relationship("User")
