from pydantic import BaseModel
from typing import Optional


class ShiftTemplateCreate(BaseModel):
    code: str
    name: str
    start_time: str
    end_time: str
    pause_min: int = 30
    color: str = "#4F46E5"
    auto_allowances: bool = True


class ShiftTemplateUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    pause_min: Optional[int] = None
    color: Optional[str] = None
    auto_allowances: Optional[bool] = None


class ShiftTemplateOut(BaseModel):
    id: int
    user_id: int
    code: str
    name: str
    start_time: str
    end_time: str
    pause_min: int
    color: str
    auto_allowances: bool

    class Config:
        from_attributes = True
