"""add_bio_column_to_users

Revision ID: a1b2c3d4e5f6
Revises: 8c606b4b4bd2
Create Date: 2026-07-29 13:47:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '8c606b4b4bd2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('users', 'bio')
