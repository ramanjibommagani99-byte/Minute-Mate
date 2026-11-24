"""add project name to meetings

Revision ID: d71c4a9f2b30
Revises: a4b63d926add
Create Date: 2026-11-19 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d71c4a9f2b30"
down_revision: Union[str, None] = "a4b63d926add"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("meetings", sa.Column("project_name", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("meetings", "project_name")
