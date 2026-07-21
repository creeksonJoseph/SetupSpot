"""User repository — all user-related DB operations."""
from sqlalchemy.orm import Session

from models.user import User


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create(db: Session, email: str, username: str, password_hash: str) -> User:
    user = User(email=email, username=username, _password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
