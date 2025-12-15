from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserBase(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
