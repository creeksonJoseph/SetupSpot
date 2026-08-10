"""Item repository — all item-related DB operations."""
from sqlalchemy.orm import Session

from models.item import Item


def create(
    db: Session,
    name: str,
    price: float,
    link: str | None,
    description: str,
    setup_id: int,
    user_id: int,
) -> Item:
    item = Item(
        name=name,
        price=price,
        link=link,
        description=description,
        image_url="",
        setup_id=setup_id,
        user_id=user_id,
    )
    db.add(item)
    db.flush()   # get item.id without committing
    return item


def delete_by_setup_id(db: Session, setup_id: int) -> None:
    """Delete all items belonging to a setup."""
    db.query(Item).filter(Item.setup_id == setup_id).delete(synchronize_session=False)
