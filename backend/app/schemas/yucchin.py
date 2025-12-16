from pydantic import BaseModel
from datetime import datetime

class UserYucchinBase(BaseModel):
    yucchin_type: int
    yucchin_name: str

class UserYucchinCreate(UserYucchinBase):
    pass

class UserYucchinResponse(UserYucchinBase):
    id: int
    user_id: int
    obtained_at: datetime

    class Config:
        from_attributes = True
