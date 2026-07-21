"""Import all models so Alembic autogenerate can see them."""
from models.user import User
from models.collection import Collection, CollectionsItems
from models.setup import Setup
from models.item import Item
from models.favorite import Favorite

__all__ = ["User", "Setup", "Item", "Collection", "CollectionsItems", "Favorite"]
