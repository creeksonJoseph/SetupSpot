from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash
from sqlalchemy import MetaData

# Consistent naming convention for constraints
naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=naming_convention)
db = SQLAlchemy(metadata=metadata)

# Association table for many-to-many between collections and items
CollectionsItems = db.Table(
    "collections_items",
    db.Column(
        "collection_id", db.Integer, db.ForeignKey("collections.id"), primary_key=True
    ),
    db.Column("item_id", db.Integer, db.ForeignKey("items.id"), primary_key=True),
)


class User(db.Model, SerializerMixin):
    __tablename__ = "users"
    serialize_rules = (
        "-_password_hash",
        "-setups",
        "-items",
        "-collections",
        "-favorites",
    )

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    _password_hash = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)

    setups = db.relationship(
        "Setup", back_populates="user", cascade="all, delete-orphan"
    )
    items = db.relationship("Item", back_populates="user", cascade="all, delete-orphan")
    collections = db.relationship(
        "Collection", back_populates="user", cascade="all, delete-orphan"
    )
    favorites = db.relationship(
        "Favorite", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def password(self):
        raise AttributeError("Password is not a readable attribute")

    @password.setter
    def password(self, password):
        self._password_hash = generate_password_hash(password)

    def __repr__(self):
        return f"<User {self.id}: {self.email}>"


class Setup(db.Model, SerializerMixin):
    __tablename__ = "setups"
    serialize_rules = ("-items", "-favorites")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255))
    annotations = db.Column(db.Text)  # Optional JSON field

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", back_populates="setups")

    items = db.relationship(
        "Item", back_populates="setup", cascade="all, delete-orphan"
    )
    favorites = db.relationship(
        "Favorite", back_populates="setup", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Setup {self.id}: {self.name}>"


class Item(db.Model, SerializerMixin):
    __tablename__ = "items"
    serialize_rules = ("-setup", "-user", "-collections")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255))
    price = db.Column(db.Float, nullable=False)
    link = db.Column(db.String(255))
    description = db.Column(db.Text)

    setup_id = db.Column(db.Integer, db.ForeignKey("setups.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    setup = db.relationship("Setup", back_populates="items")
    user = db.relationship("User", back_populates="items")
    collections = db.relationship(
        "Collection", secondary=CollectionsItems, back_populates="items"
    )

    def __repr__(self):
        return f"<Item {self.id}: {self.name}>"


class Collection(db.Model, SerializerMixin):
    __tablename__ = "collections"
    serialize_rules = ("-user", "-items")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", back_populates="collections")

    items = db.relationship(
        "Item", secondary=CollectionsItems, back_populates="collections"
    )

    def __repr__(self):
        return f"<Collection {self.id}: {self.name}>"


class Favorite(db.Model, SerializerMixin):
    __tablename__ = "favorites"
    serialize_rules = ("-user", "-setup")

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    setup_id = db.Column(db.Integer, db.ForeignKey("setups.id"), nullable=False)

    user = db.relationship("User", back_populates="favorites")
    setup = db.relationship("Setup", back_populates="favorites")

    def __repr__(self):
        return f"<Favorite {self.id}: User {self.user_id} - Setup {self.setup_id}>"
