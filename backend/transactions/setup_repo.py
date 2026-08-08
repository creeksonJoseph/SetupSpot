"""Setup repository — all setup-related DB operations."""
import json

from sqlalchemy.orm import Session

from models.setup import Setup


def get_all(db: Session) -> list[Setup]:
    return db.query(Setup).all()


def get_by_id(db: Session, setup_id: int) -> Setup | None:
    return db.query(Setup).filter(Setup.id == setup_id).first()


def get_by_user(db: Session, user_id: int) -> list[Setup]:
    return db.query(Setup).filter(Setup.user_id == user_id).all()


def create(db: Session, name: str, image_url: str, user_id: int) -> Setup:
    setup = Setup(name=name, image_url=image_url, user_id=user_id)
    db.add(setup)
    db.commit()
    db.refresh(setup)
    return setup


def update_annotations(db: Session, setup: Setup, annotation_metadata: list) -> Setup:
    setup.annotations = json.dumps(annotation_metadata)
    db.commit()
    db.refresh(setup)
    return setup


def delete(db: Session, setup: Setup) -> None:
    db.delete(setup)
    db.commit()
