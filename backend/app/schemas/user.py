from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    gdpr_accepted: bool


class UserUpdate(BaseModel):
    name: Optional[str] = None
    workplace: Optional[str] = None
    position: Optional[str] = None
    employment_type: Optional[str] = None
    profile_image: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    workplace: Optional[str]
    position: Optional[str]
    employment_type: Optional[str]
    profile_image: Optional[str]
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserAdminOut(UserOut):
    is_verified: bool
    gdpr_accepted: bool
