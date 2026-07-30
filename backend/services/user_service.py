from sqlalchemy.orm import Session
from models.user import User
from api.schemas.user import UserOut, UserSetupOut, PublicUserOut, PublicCollectionOut
from transactions import user_repo


def get_user_profile(user: User) -> UserOut:
    """Construct and return the user profile representation containing username, email, bio, avatar_url, post_count, and setups."""
    user_setups = [
        UserSetupOut(id=s.id, title=s.name, image=s.image_url)
        for s in (user.setups or [])
    ]
    return UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        bio=user.bio,
        avatar_url=user.avatar_url,
        post_count=len(user_setups),
        setups=user_setups,
    )


def get_public_profile(db: Session, user_id: int) -> PublicUserOut | None:
    """Return a pre-computed public profile for any user (no email, no favorites).

    All aggregation is done here so the frontend just renders.
    """
    user = user_repo.get_by_id(db, user_id)
    if not user:
        return None

    user_setups = [
        UserSetupOut(id=s.id, title=s.name, image=s.image_url)
        for s in (user.setups or [])
    ]

    # Build lightweight public collection previews (cover_images + item_count)
    from services.collection_service import format_collection_dto
    from transactions.collection_repo import get_by_user

    raw_collections = get_by_user(db, user_id)
    public_collections = []
    for col in raw_collections:
        dto = format_collection_dto(col)
        public_collections.append(
            PublicCollectionOut(
                id=dto["id"],
                name=dto["name"],
                item_count=dto["item_count"],
                cover_images=dto["cover_images"],
            )
        )

    return PublicUserOut(
        id=user.id,
        username=user.username,
        bio=user.bio,
        avatar_url=user.avatar_url,
        post_count=len(user_setups),
        collection_count=len(public_collections),
        setups=user_setups,
        collections=public_collections,
    )


def update_user_profile(
    db: Session,
    user: User,
    username: str | None = None,
    bio: str | None = None,
    avatar_url: str | None = None,
) -> UserOut:
    """Update profile fields for current user and return refreshed UserOut schema."""
    if username is not None:
        clean_username = username.strip()
        if not clean_username:
            raise ValueError("Username cannot be empty")
        user.username = clean_username

    if bio is not None:
        user.bio = bio.strip()

    if avatar_url is not None:
        user.avatar_url = avatar_url.strip()

    user_repo.save(db, user)
    return get_user_profile(user)

