"""User ORM model — column definitions only."""
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(100), unique=True, nullable=False)
    username = Column(String(100), nullable=False)
    _password_hash = Column("_password_hash", String(256), nullable=False)
    reset_token = Column(String(256), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    setups = relationship("Setup", back_populates="user", cascade="all, delete-orphan")
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
