from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.settings import UserSettings
from app.schemas.settings import UserSettingsUpdate

async def get_settings_by_user_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user_id))
    return result.scalars().first()

async def create_default_settings(db: AsyncSession, user_id: int):
    db_settings = UserSettings(user_id=user_id)
    db.add(db_settings)
    await db.commit()
    await db.refresh(db_settings)
    return db_settings

async def update_settings(db: AsyncSession, db_settings: UserSettings, settings_in: UserSettingsUpdate):
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.add(db_settings)
    await db.commit()
    await db.refresh(db_settings)
    return db_settings
