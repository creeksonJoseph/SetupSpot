"""CommentLike ORM model — tracks user likes on individual comments."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from core.database import Base


class CommentLike(Base):
    __tablename__ = "comment_likes"
    __table_args__ = (
        UniqueConstraint("user_id", "comment_id", name="uq_comment_likes_user_comment"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User")
    comment = relationship("Comment", back_populates="likes")
