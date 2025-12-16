from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).options(selectinload(User.settings)).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).options(selectinload(User.settings)).where(User.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Create default settings
    from app.crud.settings import create_default_settings
    await create_default_settings(db, db_user.id)
    
    # Reload user with settings
    # Since we just added settings in a separate transaction/commit, we need to refresh or re-fetch
    # A simple refresh with specific attributes is efficient
    await db.refresh(db_user, attribute_names=["settings"])

    return db_user

async def update_user(db: AsyncSession, db_user: User, user_in: UserUpdate):
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        db_user.hashed_password = hashed_password
    
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
