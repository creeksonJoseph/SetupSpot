"""User repository — all user-related DB operations."""
from sqlalchemy.orm import Session

from models.user import User


from sqlalchemy import func


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(func.lower(User.username) == username.strip().lower()).first()



def get_by_email(db: Session, email: str) -> User | None:
    if not email:
        return None
    return db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()


def get_by_reset_token(db: Session, token: str) -> User | None:
    return db.query(User).filter(User.reset_token == token).first()


def create(db: Session, email: str, username: str, password_hash: str) -> User:
    clean_email = email.strip().lower()
    user = User(email=clean_email, username=username, _password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user



def save(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
