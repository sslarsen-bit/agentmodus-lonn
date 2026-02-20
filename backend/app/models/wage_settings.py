from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base


class WageSettings(Base):
    __tablename__ = "wage_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Base rate
    hourly_rate = Column(Float, default=200.0)

    # Allowances (kr/time or %)
    evening_allowance_type = Column(String(20), default="kr")   # "kr" or "percent"
    evening_allowance_value = Column(Float, default=0.0)
    evening_from = Column(String(5), default="18:00")
    evening_to = Column(String(5), default="21:00")

    night_allowance_type = Column(String(20), default="kr")
    night_allowance_value = Column(Float, default=0.0)
    night_from = Column(String(5), default="21:00")
    night_to = Column(String(5), default="06:00")

    weekend_allowance_type = Column(String(20), default="kr")
    weekend_allowance_value = Column(Float, default=0.0)

    holiday_allowance_type = Column(String(20), default="kr")
    holiday_allowance_value = Column(Float, default=0.0)

    # Custom allowances stored as JSON list of {name, type, value}
    custom_allowances = Column(JSON, default=list)

    # Overtime thresholds
    overtime_daily_threshold = Column(Float, default=9.0)       # hours per day
    overtime_weekly_threshold = Column(Float, default=40.0)     # hours per week
    overtime_50_rate = Column(Float, default=1.5)               # multiplier
    overtime_100_rate = Column(Float, default=2.0)              # multiplier

    # Pause
    default_pause_min = Column(Integer, default=30)
    paid_pause = Column(Boolean, default=False)

    # Rounding (minutes)
    rounding_minutes = Column(Integer, default=0)
    rounding_method = Column(String(10), default="nearest")     # nearest/up/down

    # Tax & holiday pay
    tax_percent = Column(Float, default=25.0)
    holiday_pay_percent = Column(Float, default=12.0)

    user = relationship("User", back_populates="wage_settings")


class CustomAllowance(Base):
    """Not currently used – custom allowances stored as JSON in WageSettings."""
    __tablename__ = "custom_allowances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    type_ = Column(String(20), nullable=False)   # "kr" or "percent"
    value = Column(Float, nullable=False)
