"""Comment ORM model — per-setup comments by authenticated users."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship

from core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True)
    body = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    setup_id = Column(Integer, ForeignKey("setups.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="comments")
    setup = relationship("Setup", back_populates="comments")
