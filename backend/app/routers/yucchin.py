from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas.yucchin import UserYucchinCreate, UserYucchinResponse
from app.schemas.user import UserResponse
from app.models.user import User
from app.crud import get_yucchins, create_user_yucchin

router = APIRouter()

@router.get("/", response_model=List[UserYucchinResponse])
async def read_yucchins(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_yucchins(db, user_id=current_user.id)

@router.post("/", response_model=UserYucchinResponse)
async def create_new_yucchin(
    yucchin: UserYucchinCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await create_user_yucchin(db, yucchin=yucchin, user_id=current_user.id)
