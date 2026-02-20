from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("shift_templates.id"), nullable=True)

    date = Column(String(10), nullable=False)           # YYYY-MM-DD
    start_time = Column(String(5), nullable=False)      # HH:MM
    end_time = Column(String(5), nullable=False)        # HH:MM
    pause_min = Column(Integer, default=0)
    note = Column(Text, nullable=True)

    # Calculated values (stored for quick display)
    total_hours = Column(Float, default=0.0)
    base_hours = Column(Float, default=0.0)
    evening_hours = Column(Float, default=0.0)
    night_hours = Column(Float, default=0.0)
    weekend_hours = Column(Float, default=0.0)
    holiday_hours = Column(Float, default=0.0)
    overtime_50_hours = Column(Float, default=0.0)
    overtime_100_hours = Column(Float, default=0.0)
    gross_pay = Column(Float, default=0.0)

    is_holiday = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="shifts")
    template = relationship("ShiftTemplate", back_populates="shifts")
