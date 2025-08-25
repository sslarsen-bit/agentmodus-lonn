"""
Data models for the Agentmodus wage and shift application.

This module defines the core data structures used throughout the
application, including allowances, overtime rules, rounding rules,
shift templates, and individual shifts.  The models are implemented
using dataclasses to provide a clear, type annotated definition of
each entity and encapsulate small helper methods where relevant.

The intent of separating the models into their own module is to keep
the representation of domain objects isolated from business logic.
Other modules (such as the wage calculation engine and the
application manager) import and operate on these models.

Future extensions might include additional models for users,
employment contracts, expenses, or mileage reimbursement.  These can
easily be added here following the same pattern.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple
import math


@dataclass
class Allowance:
    """Represents a pay allowance that applies at certain times or days.

    An allowance can either be a fixed amount per hour (``type_ =
    'kr_per_time'``) or a percentage of the base hourly rate (``type_ =
    'prosent'``).  The allowance applies within a daily time window
    defined by ``from_time`` and ``to_time``; if the end time is earlier
    than or equal to the start time then the window is assumed to cross
    midnight into the following day.  Optionally an allowance may be
    restricted to specific weekdays (0 = Monday, …, 6 = Sunday).
    """

    type_: str
    value: float
    from_time: str
    to_time: str
    days: Optional[List[int]] = None

    def is_applicable(self, dt: datetime) -> bool:
        """Return True if this allowance applies on the given date.

        Parameters
        ----------
        dt : datetime
            A date/time within a shift segment.

        Returns
        -------
        bool
            Whether the allowance is applicable on ``dt``.  If
            ``days`` is ``None`` then the allowance applies every day.
        """
        if self.days is None:
            return True
        return dt.weekday() in self.days

    def time_bounds(self, shift_date: date) -> Tuple[datetime, datetime]:
        """Compute the allowance start and end datetimes for a specific date.

        Given a calendar date, this function returns the datetime objects
        representing the start and end of the allowance window.  If the
        configured end time precedes the start time then the end datetime
        is advanced into the next day.  This helper is useful when
        intersecting allowances with shift segments.

        Parameters
        ----------
        shift_date : date
            The date on which the shift begins.

        Returns
        -------
        Tuple[datetime, datetime]
            Start and end datetimes of the allowance window.
        """
        start_dt = datetime.combine(shift_date, datetime.strptime(self.from_time, "%H:%M").time())
        end_dt = datetime.combine(shift_date, datetime.strptime(self.to_time, "%H:%M").time())
        # Cross midnight if end <= start
        if end_dt <= start_dt:
            end_dt += timedelta(days=1)
        return start_dt, end_dt


@dataclass
class OvertimeRule:
    """Defines a rule for calculating overtime.

    The ``threshold_hours`` attribute sets the number of hours in a shift
    after which overtime begins accruing.  The ``percent`` attribute
    expresses the overtime multiplier as a decimal: for example, a value
    of 0.5 corresponds to 50 % extra pay on top of the base rate.
    Multiple overtime rules can be attached to a shift template to
    support progressive overtime levels.
    """

    threshold_hours: float
    percent: float


@dataclass
class RoundingRule:
    """Encapsulates rounding rules for shift durations.

    Shifts are often rounded to a specific increment (e.g. 5 or 15
    minutes).  The ``unit_minutes`` attribute specifies the granularity.
    The ``method`` can be one of ``'nearest'``, ``'up'``, or
    ``'down'``.  The ``apply`` method performs the rounding on a number
    of minutes and returns the rounded result.
    """

    unit_minutes: int
    method: str = 'nearest'

    def apply(self, minutes: float) -> float:
        """Round the provided minutes according to the rule.

        Parameters
        ----------
        minutes : float
            The raw number of minutes worked.

        Returns
        -------
        float
            The number of minutes rounded according to ``unit_minutes``
            and ``method``.
        """
        if self.unit_minutes <= 0:
            return minutes
        if self.method == 'nearest':
            return round(minutes / self.unit_minutes) * self.unit_minutes
        if self.method == 'up':
            return math.ceil(minutes / self.unit_minutes) * self.unit_minutes
        if self.method == 'down':
            return math.floor(minutes / self.unit_minutes) * self.unit_minutes
        return minutes


@dataclass
class ShiftTemplate:
    """Represents a predefined set of rules for a shift (a vaktkode).

    A shift template encapsulates the standard start and end times for a
    particular type of shift along with a base hourly rate, unpaid
    pause duration, allowances, overtime rules, rounding, and the
    feriepengesats (holiday pay rate).  Templates are referenced by
    their ``code`` when assigning a template to an individual shift.
    """

    code: str
    employer: str
    standard_start: str
    standard_end: str
    unpaid_pause_min: int
    base_rate: float
    allowances: List[Allowance] = field(default_factory=list)
    overtime_rules: List[OvertimeRule] = field(default_factory=list)
    rounding_rule: Optional[RoundingRule] = None
    feriepengesats: float = 0.12


@dataclass
class Shift:
    """Represents a single worked shift.

    Each shift records the calendar date, start and end times, an optional
    override for unpaid pause minutes, and the code of the template to
    use for pay calculations.  Methods are provided to convert the
    stored date and times into datetime objects for easier arithmetic.
    """

    date: date
    start_time: str
    end_time: str
    unpaid_pause_min: Optional[int] = None
    template_code: Optional[str] = None

    def start_datetime(self) -> datetime:
        """Return a datetime combining this shift's date and start time."""
        return datetime.combine(self.date, datetime.strptime(self.start_time, "%H:%M").time())

    def end_datetime(self) -> datetime:
        """Return a datetime combining this shift's date and end time.

        If the end time is earlier than or equal to the start time then
        the end datetime is assumed to fall on the next day.
        """
        end_dt = datetime.combine(self.date, datetime.strptime(self.end_time, "%H:%M").time())
        if end_dt <= self.start_datetime():
            end_dt += timedelta(days=1)
        return end_dt


@dataclass
class User:
    """Represents a user of the system.

    The user model stores basic information needed for generating wage
    reports and estimates, including name, contact details, and default
    wage parameters such as hourly rate and tax percentage.  Additional
    fields (e.g. bank account) are optional and mainly for future use.
    """
    name: str
    email: str
    position: Optional[str] = None
    union_info: Optional[str] = None
    default_hourly_rate: Optional[float] = None
    tax_percent: Optional[float] = None
    bank_account: Optional[str] = None


@dataclass
class Employment:
    """Represents an employment contract for a user.

    An employment binds a user to a specific workplace with a contract
    type and defines normal work hours per week and default break
    duration.  The model is intentionally simple; more detailed fields
    (like pay scale, contract number, etc.) could be added in future
    revisions.
    """
    workplace: str
    contract_type: str
    normal_hours_per_week: float = 37.5
    default_break_min: int = 30
