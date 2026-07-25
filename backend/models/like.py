"""Like ORM model — setup-level likes (one per user per setup)."""
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from core.database import Base


class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    setup_id = Column(Integer, ForeignKey("setups.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "setup_id", name="uq_like_user_setup"),
    )

    user = relationship("User", back_populates="likes")
    setup = relationship("Setup", back_populates="likes")
