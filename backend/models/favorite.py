"""Favorite ORM model — column definitions only."""
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from core.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    setup_id = Column(Integer, ForeignKey("setups.id"), nullable=False)

    user = relationship("User", back_populates="favorites")
    setup = relationship("Setup", back_populates="favorites")
