"""
Application manager for the Agentmodus wage system.

The ``WageManager`` class coordinates the data models and the
``WageCalculator`` to provide a simple API for users of the library.
It maintains a collection of shift templates and recorded shifts,
exposes methods to add new templates and shifts, calculates pay for
individual shifts, and produces monthly reports or CSV exports.

Separating the manager from the calculation engine allows the core
calculation logic to remain stateless and reusable while the manager
holds state about recorded shifts and user preferences.
"""

from __future__ import annotations

from typing import Dict, List

import pandas as pd

from models import ShiftTemplate, Shift
from engine import WageCalculator


class WageManager:
    """Manage shift templates, recorded shifts and pay calculations."""

    def __init__(self):
        # Mapping from template code to ShiftTemplate
        self.templates: Dict[str, ShiftTemplate] = {}
        # List of recorded shifts
        self.shifts: List[Shift] = []
        # Lazy initialised calculator; updated whenever templates change
        self._calculator: WageCalculator | None = None

    def _ensure_calculator(self) -> WageCalculator:
        """Ensure a WageCalculator is initialised with current templates."""
        if self._calculator is None:
            self._calculator = WageCalculator(self.templates)
        return self._calculator

    def add_template(self, template: ShiftTemplate) -> None:
        """Add or replace a shift template in the manager.

        If a template with the same code already exists it will be
        overwritten.  After adding a template the internal calculator is
        invalidated so that it reflects the new template set on the next
        use.
        """
        self.templates[template.code] = template
        self._calculator = None  # Invalidate cached calculator

    def add_shift(self, shift: Shift) -> None:
        """Record a new shift.

        The shift must reference a template code that exists in the
        manager.  No calculation is performed until a report is
        requested.
        """
        if shift.template_code is None or shift.template_code not in self.templates:
            raise ValueError(f"Shift template {shift.template_code} not found")
        self.shifts.append(shift)

    def calculate_shift(self, shift: Shift) -> Dict[str, float]:
        """Calculate pay for a single shift using current templates."""
        return self._ensure_calculator().calculate_shift_pay(shift)

    def monthly_report(self) -> pd.DataFrame:
        """Generate a DataFrame summarising all recorded shifts."""
        return self._ensure_calculator().monthly_report(self.shifts)

    def export_csv(self, path: str) -> None:
        """Export the monthly report to a CSV file.

        The CSV will include one row per shift with the columns defined
        in ``WageCalculator.monthly_report``.
        """
        df = self.monthly_report()
        df.to_csv(path, index=False)
