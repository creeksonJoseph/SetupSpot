"""add_performance_indexes

Adds explicit indexes on every foreign key and high-frequency filter/sort
column across all core tables.

Without these indexes every query that filters by user_id, setup_id, or
orders by created_at performs a full sequential table scan — the single
most common cause of slow API responses.

Indexes added:
  setups   : user_id, created_at
  items    : setup_id, user_id
  likes    : setup_id, user_id, (user_id, setup_id) composite
  comments : setup_id, user_id, created_at
  favorites: user_id, setup_id, (user_id, setup_id) composite

Revision ID: b7f2a1c9e3d0
Revises: a1b2c3d4e5f6
Create Date: 2026-08-07

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'b7f2a1c9e3d0'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── setups ────────────────────────────────────────────────────────────────
    # user_id: profile page "all setups by user" query
    op.create_index('ix_setups_user_id', 'setups', ['user_id'])
    # created_at DESC: default ordering for the explore feed
    op.create_index('ix_setups_created_at', 'setups', ['created_at'])

    # ── items ─────────────────────────────────────────────────────────────────
    # setup_id: "all items for a setup" — used on every detail page load
    op.create_index('ix_items_setup_id', 'items', ['setup_id'])
    # user_id: "all items by user"
    op.create_index('ix_items_user_id', 'items', ['user_id'])

    # ── likes ─────────────────────────────────────────────────────────────────
    # setup_id: COUNT(likes) per setup, used in like_count aggregation
    op.create_index('ix_likes_setup_id', 'likes', ['setup_id'])
    # user_id: "has this user liked this setup?" lookup
    op.create_index('ix_likes_user_id', 'likes', ['user_id'])
    # composite: the UniqueConstraint already prevents duplicates but a
    # composite index makes the (user_id, setup_id) existence check a
    # single index seek instead of two separate scans.
    op.create_index(
        'ix_likes_user_id_setup_id',
        'likes',
        ['user_id', 'setup_id'],
        unique=True,
    )

    # ── comments ──────────────────────────────────────────────────────────────
    # setup_id: "all comments for a setup" (most frequent comment query)
    op.create_index('ix_comments_setup_id', 'comments', ['setup_id'])
    # user_id: "all comments by a user" + permission check on delete
    op.create_index('ix_comments_user_id', 'comments', ['user_id'])
    # created_at: chronological ordering of comments
    op.create_index('ix_comments_created_at', 'comments', ['created_at'])

    # ── favorites ─────────────────────────────────────────────────────────────
    # user_id: "all favourites for a user" — used on favourites page
    op.create_index('ix_favorites_user_id', 'favorites', ['user_id'])
    # setup_id: "how many users favourited this setup" + cache enrichment
    op.create_index('ix_favorites_setup_id', 'favorites', ['setup_id'])
    # composite: fast isFavorited check (user_id, setup_id) pair lookup
    op.create_index(
        'ix_favorites_user_id_setup_id',
        'favorites',
        ['user_id', 'setup_id'],
    )


def downgrade() -> None:
    op.drop_index('ix_favorites_user_id_setup_id', table_name='favorites')
    op.drop_index('ix_favorites_setup_id', table_name='favorites')
    op.drop_index('ix_favorites_user_id', table_name='favorites')

    op.drop_index('ix_comments_created_at', table_name='comments')
    op.drop_index('ix_comments_user_id', table_name='comments')
    op.drop_index('ix_comments_setup_id', table_name='comments')

    op.drop_index('ix_likes_user_id_setup_id', table_name='likes')
    op.drop_index('ix_likes_user_id', table_name='likes')
    op.drop_index('ix_likes_setup_id', table_name='likes')

    op.drop_index('ix_items_user_id', table_name='items')
    op.drop_index('ix_items_setup_id', table_name='items')

    op.drop_index('ix_setups_created_at', table_name='setups')
    op.drop_index('ix_setups_user_id', table_name='setups')
