"""Setup ORM model — column definitions only."""
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from core.database import Base


class Setup(Base):
    __tablename__ = "setups"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    image_url = Column(String(1024))
    annotations = Column(Text)
    embedding = Column(Vector(384), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


    user = relationship("User", back_populates="setups")
    items = relationship("Item", back_populates="setup", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="setup", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="setup", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="setup", cascade="all, delete-orphan")
