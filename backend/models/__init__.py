"""Import all models so Alembic autogenerate can see them."""
from models.user import User
from models.collection import Collection, CollectionsItems
from models.setup import Setup
from models.item import Item
from models.favorite import Favorite
from models.like import Like
from models.comment import Comment
from models.feedback import Feedback

__all__ = ["User", "Setup", "Item", "Collection", "CollectionsItems", "Favorite", "Like", "Comment", "Feedback"]

