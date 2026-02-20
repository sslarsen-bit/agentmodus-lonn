from pydantic import BaseModel
from typing import Optional, List, Any


class WageSettingsUpdate(BaseModel):
    hourly_rate: Optional[float] = None
    evening_allowance_type: Optional[str] = None
    evening_allowance_value: Optional[float] = None
    evening_from: Optional[str] = None
    evening_to: Optional[str] = None
    night_allowance_type: Optional[str] = None
    night_allowance_value: Optional[float] = None
    night_from: Optional[str] = None
    night_to: Optional[str] = None
    weekend_allowance_type: Optional[str] = None
    weekend_allowance_value: Optional[float] = None
    holiday_allowance_type: Optional[str] = None
    holiday_allowance_value: Optional[float] = None
    custom_allowances: Optional[List[Any]] = None
    overtime_daily_threshold: Optional[float] = None
    overtime_weekly_threshold: Optional[float] = None
    overtime_50_rate: Optional[float] = None
    overtime_100_rate: Optional[float] = None
    default_pause_min: Optional[int] = None
    paid_pause: Optional[bool] = None
    rounding_minutes: Optional[int] = None
    rounding_method: Optional[str] = None
    tax_percent: Optional[float] = None
    holiday_pay_percent: Optional[float] = None


class WageSettingsOut(BaseModel):
    id: int
    user_id: int
    hourly_rate: float
    evening_allowance_type: str
    evening_allowance_value: float
    evening_from: str
    evening_to: str
    night_allowance_type: str
    night_allowance_value: float
    night_from: str
    night_to: str
    weekend_allowance_type: str
    weekend_allowance_value: float
    holiday_allowance_type: str
    holiday_allowance_value: float
    custom_allowances: List[Any]
    overtime_daily_threshold: float
    overtime_weekly_threshold: float
    overtime_50_rate: float
    overtime_100_rate: float
    default_pause_min: int
    paid_pause: bool
    rounding_minutes: int
    rounding_method: str
    tax_percent: float
    holiday_pay_percent: float

    class Config:
        from_attributes = True
