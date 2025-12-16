from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.schemas.training import TrainingLogCreate, TrainingLogResponse, TrainingStatsResponse
from app.crud import get_training_logs, create_training_log, get_training_stats

router = APIRouter()

@router.get("/training-logs/stats", response_model=TrainingStatsResponse)
async def read_training_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_training_stats(db, user_id=current_user.id)

@router.get("/training-logs", response_model=List[TrainingLogResponse])
async def read_training_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_training_logs(db, user_id=current_user.id)

@router.post("/training-logs", response_model=TrainingLogResponse)
async def create_new_training_log(
    log: TrainingLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await create_training_log(db, log=log, user_id=current_user.id)
