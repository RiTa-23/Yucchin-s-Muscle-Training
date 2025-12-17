from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdate
from app.crud.settings import get_settings_by_user_id, update_settings, create_default_settings
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserSettingsResponse)
async def read_user_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    settings = await get_settings_by_user_id(db, current_user.id)
    if not settings:
        # Lazy creation for existing users who don't have settings yet
        settings = await create_default_settings(db, current_user.id)
    return settings

@router.put("/me", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    settings = await get_settings_by_user_id(db, current_user.id)
    if not settings:
         # Should not happen if GET is called first, but safe to handle
        settings = await create_default_settings(db, current_user.id)
    
    return await update_settings(db, settings, settings_in)
