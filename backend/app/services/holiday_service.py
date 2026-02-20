"""Norwegian public holidays using the `holidays` library."""

import holidays
from datetime import date
from functools import lru_cache


@lru_cache(maxsize=10)
def _get_norwegian_holidays(year: int):
    return holidays.Norway(years=year)


def is_norwegian_holiday(d: date) -> bool:
    return d in _get_norwegian_holidays(d.year)


def get_holidays_for_month(year: int, month: int) -> list[str]:
    h = _get_norwegian_holidays(year)
    return [str(d) for d in h if d.year == year and d.month == month]
