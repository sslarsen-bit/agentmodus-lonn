"""
Wage calculation engine.

Calculates hours split by type (base, evening, night, weekend, holiday,
overtime) and the corresponding gross pay for a single shift, given a
user's WageSettings.
"""

from datetime import datetime, date, timedelta
from typing import Dict

from ..models.wage_settings import WageSettings
from ..models.shift import Shift
from ..utils.time_utils import shift_datetimes, overlap_minutes
from .holiday_service import is_norwegian_holiday


def _allowance_kr(ws: WageSettings, atype: str, avalue: float, hours: float) -> float:
    if atype == "kr":
        return avalue * hours
    else:  # percent
        return ws.hourly_rate * (avalue / 100) * hours


def _window_datetimes(d: date, from_str: str, to_str: str):
    """Return (start, end) window datetimes for a given date.
    Handles cross-midnight windows (to_str <= from_str)."""
    fmt = "%H:%M"
    start = datetime.combine(d, datetime.strptime(from_str, fmt).time())
    end = datetime.combine(d, datetime.strptime(to_str, fmt).time())
    if end <= start:
        end += timedelta(days=1)
    return start, end


def calculate_shift(shift: Shift, ws: WageSettings) -> Dict[str, float]:
    """
    Calculate hours and pay for a single shift.

    Returns a dict with:
      total_hours, base_hours, evening_hours, night_hours,
      weekend_hours, holiday_hours, overtime_50_hours,
      overtime_100_hours, gross_pay, is_holiday
    """
    start, end = shift_datetimes(shift.date, shift.start_time, shift.end_time)
    d = datetime.strptime(shift.date, "%Y-%m-%d").date()

    pause_min = shift.pause_min or 0
    if not ws.paid_pause:
        effective_end = end - timedelta(minutes=pause_min)
    else:
        effective_end = end

    total_minutes = max(0.0, (effective_end - start).total_seconds() / 60)

    # Rounding
    if ws.rounding_minutes > 0:
        from ..utils.time_utils import round_minutes
        total_minutes = round_minutes(total_minutes, ws.rounding_minutes, ws.rounding_method)

    total_hours = total_minutes / 60
    is_holiday = is_norwegian_holiday(d)
    is_saturday = d.weekday() == 5
    is_sunday = d.weekday() == 6

    # --- Segment analysis ---
    evening_min = 0.0
    night_min = 0.0

    if ws.evening_allowance_value > 0:
        e_start, e_end = _window_datetimes(d, ws.evening_from, ws.evening_to)
        evening_min += overlap_minutes(start, effective_end, e_start, e_end)
        # also check next day window
        e_start2, e_end2 = _window_datetimes(d + timedelta(days=1), ws.evening_from, ws.evening_to)
        evening_min += overlap_minutes(start, effective_end, e_start2, e_end2)

    if ws.night_allowance_value > 0:
        n_start, n_end = _window_datetimes(d, ws.night_from, ws.night_to)
        night_min += overlap_minutes(start, effective_end, n_start, n_end)
        n_start2, n_end2 = _window_datetimes(d + timedelta(days=1), ws.night_from, ws.night_to)
        night_min += overlap_minutes(start, effective_end, n_start2, n_end2)

    # Clamp to total
    evening_min = min(evening_min, total_minutes)
    night_min = min(night_min, total_minutes)

    weekend_hours = total_hours if (is_saturday or is_sunday) else 0.0
    holiday_hours = total_hours if is_holiday else 0.0

    # Base hours = total minus overtime (calculated below)
    # Overtime: daily threshold
    ot_50_h = 0.0
    ot_100_h = 0.0

    if total_hours > ws.overtime_daily_threshold:
        excess = total_hours - ws.overtime_daily_threshold
        if is_holiday or is_sunday:
            ot_100_h = excess
        else:
            ot_50_h = excess

    base_hours = total_hours - ot_50_h - ot_100_h

    # --- Pay calculation ---
    base_pay = base_hours * ws.hourly_rate

    evening_hours_val = evening_min / 60
    night_hours_val = night_min / 60

    evening_pay = _allowance_kr(ws, ws.evening_allowance_type, ws.evening_allowance_value, evening_hours_val)
    night_pay = _allowance_kr(ws, ws.night_allowance_type, ws.night_allowance_value, night_hours_val)

    weekend_pay = 0.0
    if weekend_hours > 0:
        weekend_pay = _allowance_kr(ws, ws.weekend_allowance_type, ws.weekend_allowance_value, weekend_hours)

    holiday_pay_add = 0.0
    if holiday_hours > 0:
        holiday_pay_add = _allowance_kr(ws, ws.holiday_allowance_type, ws.holiday_allowance_value, holiday_hours)

    ot_50_pay = ot_50_h * ws.hourly_rate * ws.overtime_50_rate
    ot_100_pay = ot_100_h * ws.hourly_rate * ws.overtime_100_rate

    gross_pay = base_pay + evening_pay + night_pay + weekend_pay + holiday_pay_add + ot_50_pay + ot_100_pay

    return {
        "total_hours": round(total_hours, 4),
        "base_hours": round(base_hours, 4),
        "evening_hours": round(evening_hours_val, 4),
        "night_hours": round(night_hours_val, 4),
        "weekend_hours": round(weekend_hours, 4),
        "holiday_hours": round(holiday_hours, 4),
        "overtime_50_hours": round(ot_50_h, 4),
        "overtime_100_hours": round(ot_100_h, 4),
        "gross_pay": round(gross_pay, 2),
        "is_holiday": is_holiday,
    }


def calculate_month(shifts: list, ws: WageSettings) -> Dict[str, float]:
    """Aggregate all shifts in a month and compute totals including weekly OT."""
    totals = {
        "total_hours": 0.0,
        "base_hours": 0.0,
        "evening_hours": 0.0,
        "night_hours": 0.0,
        "weekend_hours": 0.0,
        "holiday_hours": 0.0,
        "overtime_50_hours": 0.0,
        "overtime_100_hours": 0.0,
        "gross_pay": 0.0,
    }

    # Group shifts by ISO week for weekly OT check
    week_hours: Dict[int, float] = {}

    for shift in shifts:
        result = calculate_shift(shift, ws)
        for key in totals:
            totals[key] += result[key]
        d = datetime.strptime(shift.date, "%Y-%m-%d").date()
        week = d.isocalendar()[1]
        week_hours[week] = week_hours.get(week, 0.0) + result["total_hours"]

    # Weekly OT adjustments
    for week, hours in week_hours.items():
        if hours > ws.overtime_weekly_threshold:
            extra = hours - ws.overtime_weekly_threshold
            totals["overtime_50_hours"] += extra
            totals["base_hours"] = max(0.0, totals["base_hours"] - extra)
            totals["gross_pay"] += extra * ws.hourly_rate * (ws.overtime_50_rate - 1)

    gross = totals["gross_pay"]
    tax = round(gross * ws.tax_percent / 100, 2)
    net = round(gross - tax, 2)
    holiday_pay_base = gross
    holiday_pay_earned = round(gross * ws.holiday_pay_percent / 100, 2)

    return {
        **{k: round(v, 4) for k, v in totals.items()},
        "tax_deduction": tax,
        "net_pay": net,
        "holiday_pay_base": round(holiday_pay_base, 2),
        "holiday_pay_earned": holiday_pay_earned,
    }
