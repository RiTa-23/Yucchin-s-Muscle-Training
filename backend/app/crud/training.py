from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy import func, desc, cast, Date
from datetime import datetime, date, timedelta
from typing import List, Dict
from app.models.training import TrainingLog
from app.schemas.training import TrainingLogCreate, ExerciseStats, TrainingStatsResponse

async def get_training_logs(db: AsyncSession, user_id: int):
    # Order by performed_at descending to show newest first
    result = await db.execute(select(TrainingLog).where(TrainingLog.user_id == user_id).order_by(TrainingLog.performed_at.desc()))
    return result.scalars().all()

async def create_training_log(db: AsyncSession, log: TrainingLogCreate, user_id: int):
    db_log = TrainingLog(
        user_id=user_id,
        performed_at=log.performed_at,
        exercise_name=log.exercise_name,
        count=log.count,
        duration=log.duration
    )
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)
    return db_log

async def get_training_stats(db: AsyncSession, user_id: int) -> TrainingStatsResponse:
    # 1. Total Stats
    total_query = select(
        TrainingLog.exercise_name,
        func.sum(TrainingLog.count).label("total_count"),
        func.sum(TrainingLog.duration).label("total_duration")
    ).where(TrainingLog.user_id == user_id).group_by(TrainingLog.exercise_name)
    
    total_result = await db.execute(total_query)
    total_stats = []
    for row in total_result:
        total_stats.append(ExerciseStats(
            exercise_name=row.exercise_name,
            total_count=row.total_count or 0,
            total_duration=row.total_duration or 0
        ))

    # 2. Today's Stats
    today = datetime.now().date()
    # Note: performed_at is DateTime, so we need to filter safely.
    # Depending on DB, func.date() might vary. casting to Date is usually safe.
    today_query = select(
        TrainingLog.exercise_name,
        func.sum(TrainingLog.count).label("total_count"),
        func.sum(TrainingLog.duration).label("total_duration")
    ).where(
        TrainingLog.user_id == user_id,
        cast(TrainingLog.performed_at, Date) == today
    ).group_by(TrainingLog.exercise_name)

    today_result = await db.execute(today_query)
    today_stats = []
    for row in today_result:
        today_stats.append(ExerciseStats(
            exercise_name=row.exercise_name,
            total_count=row.total_count or 0,
            total_duration=row.total_duration or 0
        ))

    # 3. Streak Calculation
    # Get all distinct dates performed by user, ordered desc
    dates_query = select(cast(TrainingLog.performed_at, Date)).where(
        TrainingLog.user_id == user_id
    ).distinct().order_by(desc(cast(TrainingLog.performed_at, Date)))
    
    dates_result = await db.execute(dates_query)
    performed_dates = dates_result.scalars().all()

    streak_days = 0
    if performed_dates:
        # Check if performed today or yesterday to keep streak alive
        last_date = performed_dates[0]
        if last_date == today or last_date == today - timedelta(days=1):
            current_check = today
            # If not performed today, start checking from yesterday for streak
            if last_date != today:
                current_check = today - timedelta(days=1)
            
            streak_days = 0 
            # We need to iterate the actual dates. 
            # Logic: list is [today, yesterday, 2 days ago...] (if no gaps)
            # Actually simplest is: iterate dates, check if it matches expected `current_check`
            
            # Reset check to the most recent performed date to start counting backwards
            current_checking_date = last_date
            streak_days = 1 # We know at least one day (last_date) exists
            
            for i in range(1, len(performed_dates)):
                prev_date = performed_dates[i]
                if prev_date == current_checking_date - timedelta(days=1):
                    streak_days += 1
                    current_checking_date = prev_date
                else:
                    break
        else:
             streak_days = 0

    return TrainingStatsResponse(
        streak_days=streak_days,
        today_stats=today_stats,
        total_stats=total_stats
    )
