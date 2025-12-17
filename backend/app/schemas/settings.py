from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UserSettingsBase(BaseModel):
    bgm_volume: int = Field(50, ge=0, le=100)
    yucchin_sound: bool = True
    yucchin_hidden: bool = False
    yucchin_id: int = 1
    fps: int = Field(20, ge=1, le=60)

class UserSettingsUpdate(BaseModel):
    bgm_volume: Optional[int] = Field(None, ge=0, le=100)
    yucchin_sound: Optional[bool] = None
    yucchin_hidden: Optional[bool] = None
    yucchin_id: Optional[int] = None
    fps: Optional[int] = Field(None, ge=1, le=60)

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
