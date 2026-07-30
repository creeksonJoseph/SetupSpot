"""Item ORM model — column definitions only."""
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from core.database import Base
from models.collection import CollectionsItems


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    image_url = Column(String(1024))
    price = Column(Float, nullable=False)
    link = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    setup_id = Column(Integer, ForeignKey("setups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


    setup = relationship("Setup", back_populates="items")
    user = relationship("User", back_populates="items")
    collections = relationship("Collection", secondary=CollectionsItems, back_populates="items")
