"""
Wage calculation engine for the Agentmodus shift application.

This module contains the ``WageCalculator`` class which is responsible
for turning a list of shift templates into concrete pay amounts for
individual shifts.  It computes base pay, applies any applicable
allowances (e.g. evening, night, weekend), calculates overtime
according to one or more rules, and determines feriepenger (holiday
pay) on top of the gross pay.

The engine operates on the dataclasses defined in ``models.py`` and
produces plain Python dictionaries or pandas DataFrames for further
processing.  It is intended to be imported by higher level modules
such as ``manager.py``.
"""

from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Dict, List, Tuple, Optional

import pandas as pd

from models import Allowance, OvertimeRule, RoundingRule, ShiftTemplate, Shift


class WageCalculator:
    """Compute pay breakdowns for shifts based on templates.

    Parameters
    ----------
    templates : Dict[str, ShiftTemplate]
        A mapping of template codes to shift templates.  These are used
        to look up pay rules when processing shifts.
    """

    def __init__(self, templates: Dict[str, ShiftTemplate]):
        self.templates = templates

    def calculate_shift_pay(self, shift: Shift) -> Dict[str, float]:
        """Calculate the pay for a single shift.

        The returned dictionary contains a breakdown of the shift into
        base hours and pay, allowance hours and pay, overtime hours and
        pay, gross pay, and feriepenger.  If the shift references a
        template code that is not found, a ``ValueError`` is raised.

        Parameters
        ----------
        shift : Shift
            The shift for which to calculate pay.

        Returns
        -------
        Dict[str, float]
            A mapping of keys such as ``'base_hours'``, ``'base_pay'``,
            ``'allowance_pay'``, ``'overtime_pay'``, ``'gross_pay'`` and
            ``'feriepenger'``.
        """
        if shift.template_code is None or shift.template_code not in self.templates:
            raise ValueError(f"No template found for shift code {shift.template_code}")
        template = self.templates[shift.template_code]

        # Determine working period and subtract pauses
        start_dt = shift.start_datetime()
        end_dt = shift.end_datetime()
        total_minutes = (end_dt - start_dt).total_seconds() / 60.0
        pause = shift.unpaid_pause_min if shift.unpaid_pause_min is not None else template.unpaid_pause_min
        work_minutes = max(total_minutes - pause, 0)

        # Rounding
        if template.rounding_rule:
            work_minutes = template.rounding_rule.apply(work_minutes)

        work_hours = work_minutes / 60.0

        # Base pay (before allowances and overtime)
        base_pay = work_hours * template.base_rate

        # Compute allowances per segment
        allowance_pay, allowance_minutes = self._compute_allowances(start_dt, end_dt, pause, template)

        # Compute overtime pay
        overtime_pay, overtime_minutes = self._compute_overtime(work_hours, template)

        gross_pay = base_pay + allowance_pay + overtime_pay
        feriepenger = gross_pay * template.feriepengesats

        return {
            'base_hours': work_hours - (overtime_minutes / 60.0),
            'base_pay': base_pay,
            'allowance_pay': allowance_pay,
            'overtime_hours': overtime_minutes / 60.0,
            'overtime_pay': overtime_pay,
            'gross_pay': gross_pay,
            'feriepenger': feriepenger,
        }

    def _compute_allowances(self, start_dt: datetime, end_dt: datetime, unpaid_pause_min: int,
                             template: ShiftTemplate) -> Tuple[float, float]:
        """Calculate total allowance pay and minutes for a shift.

        The algorithm splits the shift (minus unpaid pauses) into minute
        increments and checks each minute against the allowance
        windows.  Although coarse, this method ensures that allowances
        spanning midnight and crossing the pause boundaries are
        correctly handled.  For performance reasons, allowances are
        aggregated by type (percentage vs. fixed per hour) before
        computing pay.

        Returns
        -------
        Tuple[float, float]
            The total allowance pay and the total minutes to which
            allowances were applied.
        """
        # Build a list of applicable allowance segments
        allowance_minutes = 0.0
        allowance_pay = 0.0

        # Determine pause boundaries within the shift (if any)
        pause_start = start_dt + timedelta(minutes=(end_dt - start_dt).total_seconds() / 60 - unpaid_pause_min)
        pause_end = end_dt

        # Iterate through allowances
        for allowance in template.allowances:
            # Iterate over each minute of the shift
            current_dt = start_dt
            while current_dt < end_dt:
                # Skip minutes that fall in unpaid pause
                if pause_start <= current_dt < pause_end:
                    current_dt += timedelta(minutes=1)
                    continue
                if allowance.is_applicable(current_dt):
                    a_start, a_end = allowance.time_bounds(current_dt.date())
                    # Determine whether the current minute lies in the allowance window
                    if a_start <= current_dt < a_end:
                        allowance_minutes += 1
                        if allowance.type_ == 'kr_per_time':
                            allowance_pay += allowance.value / 60.0
                        elif allowance.type_ == 'prosent':
                            # Percent allowances are based on the base rate
                            allowance_pay += template.base_rate * allowance.value / 60.0
                current_dt += timedelta(minutes=1)

        return allowance_pay, allowance_minutes

    def _compute_overtime(self, work_hours: float, template: ShiftTemplate) -> Tuple[float, float]:
        """Compute overtime pay and minutes.

        Overtime rules in the template are applied in ascending order of
        ``threshold_hours``.  Each rule applies to the portion of
        work hours above its threshold and below the next threshold (if
        any).  The overtime pay is calculated as base_rate × overtime
        hours × overtime percent.

        Returns
        -------
        Tuple[float, float]
            The overtime pay and the total overtime minutes.
        """
        overtime_pay = 0.0
        overtime_minutes = 0.0
        # Sort rules by threshold for progressive calculation
        rules = sorted(template.overtime_rules, key=lambda r: r.threshold_hours)
        remaining_hours = work_hours
        for idx, rule in enumerate(rules):
            next_threshold = rules[idx + 1].threshold_hours if idx + 1 < len(rules) else None
            if remaining_hours > rule.threshold_hours:
                # Overtime hours under this rule
                if next_threshold is None:
                    overtime_for_rule = remaining_hours - rule.threshold_hours
                else:
                    overtime_for_rule = min(remaining_hours, next_threshold) - rule.threshold_hours
                overtime_minutes += overtime_for_rule * 60.0
                overtime_pay += overtime_for_rule * template.base_rate * rule.percent
        return overtime_pay, overtime_minutes

    def monthly_report(self, shifts: List[Shift]) -> pd.DataFrame:
        """Generate a pandas DataFrame summarising the given shifts.

        Each row corresponds to a shift and includes the date, template code,
        hours worked, allowance pay, overtime pay, gross pay, and
        feriepenger.  The DataFrame is suitable for further analysis,
        reporting, or export to CSV/Excel.

        Parameters
        ----------
        shifts : List[Shift]
            The list of shifts to include in the report.  Each shift
            must reference a valid template code present in
            ``self.templates``.

        Returns
        -------
        pandas.DataFrame
            A DataFrame with one row per shift and computed pay columns.
        """
        records = []
        for shift in shifts:
            pay = self.calculate_shift_pay(shift)
            records.append({
                'date': shift.date,
                'template': shift.template_code,
                'base_hours': pay['base_hours'],
                'base_pay': pay['base_pay'],
                'allowance_pay': pay['allowance_pay'],
                'overtime_hours': pay['overtime_hours'],
                'overtime_pay': pay['overtime_pay'],
                'gross_pay': pay['gross_pay'],
                'feriepenger': pay['feriepenger'],
            })
        return pd.DataFrame.from_records(records)
