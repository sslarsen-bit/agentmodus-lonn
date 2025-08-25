https://github.com/sslarsen-bit/agentmodus-lonn/new/main?filename=preview_cli.py
#!/usr/bin/env python3

"""
preview_cli.py - demonstration script for Agentmodus Lønn.

This script registers a demo user, creates some shift templates, records a few shifts and
prints out a monthly report for August 2025.

Run this script from the repository root:
    python preview_cli.py
"""

from datetime import datetime, timezone

from models import Allowance, OvertimeRule, RoundingRule
from app import WageApp


def main() -> None:
    app = WageApp()
    user_id = app.register_user("Demo User", "demo@example.com", "secret")

    # Define allowances: evening (20%) and night (40%) OB
    evening = Allowance(percent=0.20, start_time="18:00", end_time="21:00", days_of_week=[0, 1, 2, 3, 4, 5, 6])
    night = Allowance(percent=0.40, start_time="21:00", end_time="06:00", days_of_week=[0, 1, 2, 3, 4, 5, 6])

    # Overtime rule: 50% after 9 hours per day
    overtime = OvertimeRule(threshold=9, unit="day", percent=0.50)

    # Rounding rule: nearest 15 minutes
    rounding = RoundingRule(unit_minutes=15, method="nearest")

    # Create a template
    template_id = app.create_shift_template(
        user_id=user_id,
        name="Kveldsvakt",
        rate=200.0,
        allowances=[evening, night],
        overtime_rules=[overtime],
        rounding_rule=rounding,
    )

    # Record some shifts in August 2025
    app.record_shift(user_id, template_id,
        datetime(2025, 8, 24, 16, 0, tzinfo=timezone.utc),
        datetime(2025, 8, 24, 23, 0, tzinfo=timezone.utc))

    app.record_shift(user_id, template_id,
        datetime(2025, 8, 25, 16, 0, tzinfo=timezone.utc),
        datetime(2025, 8, 25, 23, 30, tzinfo=timezone.utc))

    # Generate and print report
    report = app.generate_monthly_report(user_id, 2025, 8)
    print(report)


if __name__ == "__main__":
    main()
