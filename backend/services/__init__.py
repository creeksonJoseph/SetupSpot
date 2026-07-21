from services.auth_service import register, login, get_current_user
from services.setup_service import create_setup, get_setup_detail, delete_setup, list_setups_for_user
from services.collection_service import list_for_user, create, rename, delete
from services.favorite_service import add, remove, list_for_user as list_favorites

__all__ = [
    "register", "login", "get_current_user",
    "create_setup", "get_setup_detail", "delete_setup", "list_setups_for_user",
    "list_for_user", "create", "rename", "delete",
    "add", "remove", "list_favorites",
]
