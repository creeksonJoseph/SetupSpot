"""Collection ORM model and its association table — definitions only."""
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship

from core.database import Base


# Association table for the many-to-many between collections and items
CollectionsItems = Table(
    "collections_items",
    Base.metadata,
    Column("collection_id", Integer, ForeignKey("collections.id"), primary_key=True),
    Column("item_id", Integer, ForeignKey("items.id"), primary_key=True),
)


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


    user = relationship("User", back_populates="collections")
    items = relationship("Item", secondary=CollectionsItems, back_populates="collections")
