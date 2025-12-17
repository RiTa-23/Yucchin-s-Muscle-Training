from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class TrainingLogBase(BaseModel):
    performed_at: datetime
    exercise_name: str
    count: Optional[int] = None
    duration: Optional[int] = None

class TrainingLogCreate(TrainingLogBase):
    pass

class TrainingLogResponse(TrainingLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExerciseStats(BaseModel):
    exercise_name: str
    total_count: int = 0
    total_duration: int = 0

class TrainingStatsResponse(BaseModel):
    streak_days: int
    today_stats: List[ExerciseStats]
    total_stats: List[ExerciseStats]
