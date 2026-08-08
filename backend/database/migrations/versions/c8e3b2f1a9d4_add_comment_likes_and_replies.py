"""add_comment_likes_and_replies

Adds parent_id column to comments table for nested comment replies
and creates comment_likes table for comment likes.

Revision ID: c8e3b2f1a9d4
Revises: b7f2a1c9e3d0
Create Date: 2026-08-07

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c8e3b2f1a9d4'
down_revision = 'b7f2a1c9e3d0'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add parent_id column to comments table
    op.add_column('comments', sa.Column('parent_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        op.f('fk_comments_parent_id_comments'),
        'comments', 'comments',
        ['parent_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_index(op.f('ix_comments_parent_id'), 'comments', ['parent_id'], unique=False)

    # 2. Create comment_likes table
    op.create_table(
        'comment_likes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('comment_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['comment_id'], ['comments.id'], name=op.f('fk_comment_likes_comment_id_comments'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_comment_likes_user_id_users'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_comment_likes')),
        sa.UniqueConstraint('user_id', 'comment_id', name='uq_comment_likes_user_comment')
    )
    op.create_index(op.f('ix_comment_likes_comment_id'), 'comment_likes', ['comment_id'], unique=False)
    op.create_index(op.f('ix_comment_likes_user_id'), 'comment_likes', ['user_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_comment_likes_user_id'), table_name='comment_likes')
    op.drop_index(op.f('ix_comment_likes_comment_id'), table_name='comment_likes')
    op.drop_table('comment_likes')

    op.drop_index(op.f('ix_comments_parent_id'), table_name='comments')
    op.drop_constraint(op.f('fk_comments_parent_id_comments'), 'comments', type_='foreignkey')
    op.drop_column('comments', 'parent_id')
