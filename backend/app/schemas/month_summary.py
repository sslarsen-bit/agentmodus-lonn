from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MonthSummaryCreate(BaseModel):
    year: int
    month: int


class MonthSummaryOut(BaseModel):
    id: int
    user_id: int
    year: int
    month: int
    total_hours: float
    base_hours: float
    evening_hours: float
    night_hours: float
    weekend_hours: float
    holiday_hours: float
    overtime_50_hours: float
    overtime_100_hours: float
    gross_pay: float
    tax_deduction: float
    net_pay: float
    holiday_pay_base: float
    holiday_pay_earned: float
    is_locked: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
