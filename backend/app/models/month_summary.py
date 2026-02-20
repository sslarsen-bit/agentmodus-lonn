from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class MonthSummary(Base):
    __tablename__ = "month_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)

    total_hours = Column(Float, default=0.0)
    base_hours = Column(Float, default=0.0)
    evening_hours = Column(Float, default=0.0)
    night_hours = Column(Float, default=0.0)
    weekend_hours = Column(Float, default=0.0)
    holiday_hours = Column(Float, default=0.0)
    overtime_50_hours = Column(Float, default=0.0)
    overtime_100_hours = Column(Float, default=0.0)

    gross_pay = Column(Float, default=0.0)
    tax_deduction = Column(Float, default=0.0)
    net_pay = Column(Float, default=0.0)
    holiday_pay_base = Column(Float, default=0.0)
    holiday_pay_earned = Column(Float, default=0.0)

    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="month_summaries")

    __table_args__ = (UniqueConstraint("user_id", "year", "month", name="uq_user_year_month"),)
