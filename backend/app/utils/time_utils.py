from datetime import datetime, date, timedelta
from typing import Tuple


def parse_time(date_str: str, time_str: str) -> datetime:
    """Combine a date string (YYYY-MM-DD) and time string (HH:MM) into a datetime."""
    d = datetime.strptime(date_str, "%Y-%m-%d").date()
    t = datetime.strptime(time_str, "%H:%M").time()
    return datetime.combine(d, t)


def shift_datetimes(date_str: str, start_str: str, end_str: str) -> Tuple[datetime, datetime]:
    """Return (start_dt, end_dt) for a shift, handling midnight crossings."""
    start = parse_time(date_str, start_str)
    end = parse_time(date_str, end_str)
    if end <= start:
        end += timedelta(days=1)
    return start, end


def overlap_minutes(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> float:
    """Return the number of minutes the two intervals overlap."""
    latest_start = max(a_start, b_start)
    earliest_end = min(a_end, b_end)
    delta = (earliest_end - latest_start).total_seconds() / 60
    return max(0.0, delta)


def is_weekend(dt: datetime) -> bool:
    return dt.weekday() >= 5  # Saturday = 5, Sunday = 6


def round_minutes(minutes: float, unit: int, method: str) -> float:
    if unit <= 0:
        return minutes
    import math
    if method == "up":
        return math.ceil(minutes / unit) * unit
    if method == "down":
        return math.floor(minutes / unit) * unit
    return round(minutes / unit) * unit
