from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base


class ShiftTemplate(Base):
    __tablename__ = "shift_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String(10), nullable=False)
    name = Column(String(100), nullable=False)
    start_time = Column(String(5), nullable=False)   # HH:MM
    end_time = Column(String(5), nullable=False)     # HH:MM
    pause_min = Column(Integer, default=30)
    color = Column(String(20), default="#4F46E5")
    auto_allowances = Column(Boolean, default=True)  # auto-calculate based on time

    user = relationship("User", back_populates="shift_templates")
    shifts = relationship("Shift", back_populates="template")
