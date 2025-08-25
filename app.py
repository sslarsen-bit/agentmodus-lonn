"""
app.py - High-level application manager for Agentmodus Lønn.

This module coordinates the database (in-memory) and wage engine to allow user
registration, authentication, template creation, shift recording, and report
generation.

It uses the InMemoryDatabase for persistence and the WageCalculator to compute
base pay, allowances, overtime and feriepenger for each shift.

Note: This is a simplified implementation for demonstration purposes. In a
production system you would replace the in-memory database with a persistent
storage backend and add more robust error handling and input validation.
"""

from datetime import datetime
from typing import List, Optional

from models import Allowance, OvertimeRule, RoundingRule, ShiftTemplate, Shift
from engine import WageCalculator
from database import InMemoryDatabase

class WageApp:
    """High-level application class combining the database and wage calculator."""

    def __init__(self) -> None:
        self.db = InMemoryDatabase()
        self.calculator = WageCalculator()

    def register_user(self, name: str, email: str, password: str) -> str:
        """
        Register a new user and return the assigned user ID.
        """
        return self.db.register_user(name, email, password)

    def authenticate_user(self, email: str, password: str) -> Optional[str]:
        """
        Authenticate a user by email and password. Returns the user ID if the
        credentials are valid, otherwise returns None.
        """
        return self.db.authenticate_user(email, password)

    def create_shift_template(
        self,
        user_id: str,
        name: str,
        rate: float,
        allowances: Optional[List[Allowance]] = None,
        overtime_rules: Optional[List[OvertimeRule]] = None,
        rounding_rule: Optional[RoundingRule] = None,
    ) -> str:
        """
        Create a shift template for a user. Returns the template ID assigned
        by the database.
        """
        template = ShiftTemplate(
            id="",  # placeholder; database will assign
            name=name,
            rate=rate,
            allowances=allowances or [],
            overtime_rules=overtime_rules or [],
            rounding_rule=rounding_rule,
        )
        return self.db.add_template(user_id, template)

    def record_shift(
        self,
        user_id: str,
        template_id: str,
        start: datetime,
        end: datetime,
    ) -> None:
        """
        Record a shift for the given user using the specified template. The
        start and end arguments must be timezone-aware datetimes.
        """
        template = self.db.get_template(user_id, template_id)
        shift = Shift(
            user_id=user_id,
            template=template,
            start=start,
            end=end,
        )
        self.db.add_shift(user_id, shift)

    def generate_monthly_report(self, user_id: str, year: int, month: int):
        """
        Generate a pandas.DataFrame summarising all shifts for the given user
        in the specified month. The DataFrame includes columns for base pay,
        allowances, overtime, gross pay and feriepenger.
        """
        shifts = self.db.get_shifts(user_id, year, month)
        return self.calculator.generate_monthly_report(shifts)
