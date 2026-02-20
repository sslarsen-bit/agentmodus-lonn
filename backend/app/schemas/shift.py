from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ShiftCreate(BaseModel):
    date: str               # YYYY-MM-DD
    start_time: str         # HH:MM
    end_time: str           # HH:MM
    pause_min: int = 0
    template_id: Optional[int] = None
    note: Optional[str] = None


class ShiftUpdate(BaseModel):
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    pause_min: Optional[int] = None
    template_id: Optional[int] = None
    note: Optional[str] = None


class ShiftOut(BaseModel):
    id: int
    user_id: int
    template_id: Optional[int]
    date: str
    start_time: str
    end_time: str
    pause_min: int
    note: Optional[str]
    total_hours: float
    base_hours: float
    evening_hours: float
    night_hours: float
    weekend_hours: float
    holiday_hours: float
    overtime_50_hours: float
    overtime_100_hours: float
    gross_pay: float
    is_holiday: bool
    created_at: datetime

    class Config:
        from_attributes = True
