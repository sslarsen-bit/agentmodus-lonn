from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    workplace = Column(String(255), nullable=True)
    position = Column(String(255), nullable=True)
    employment_type = Column(String(50), nullable=True)
    profile_image = Column(Text, nullable=True)  # base64 or path
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    gdpr_accepted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    wage_settings = relationship("WageSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shift_templates = relationship("ShiftTemplate", back_populates="user", cascade="all, delete-orphan")
    shifts = relationship("Shift", back_populates="user", cascade="all, delete-orphan")
    month_summaries = relationship("MonthSummary", back_populates="user", cascade="all, delete-orphan")
