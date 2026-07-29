"""User service — profile and user business logic."""
from models.user import User
from api.schemas.user import UserOut, UserSetupOut


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
