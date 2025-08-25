"""
Entry point demonstrating the Agentmodus wage calculation package.

This script shows how to set up a few simple shift templates, record
some shifts, and generate a monthly report.  It uses the ``WageManager``
class to coordinate templates and shifts, and prints the resulting
report to the console.  If run as ``python main.py`` it will execute
the demonstration automatically.
"""

from datetime import date

from models import Allowance, OvertimeRule, RoundingRule, ShiftTemplate, Shift
from manager import WageManager


def create_demo_templates() -> dict:
    """Create a set of demo templates based on typical Norwegian rules."""
    templates = {}
    # Day shift (no allowances)
    templates['D'] = ShiftTemplate(
        code='D',
        employer='Demo Co.',
        standard_start='08:00',
        standard_end='16:00',
        unpaid_pause_min=30,
        base_rate=200.0,
        allowances=[],
        overtime_rules=[OvertimeRule(threshold_hours=8.0, percent=0.5),
                        OvertimeRule(threshold_hours=10.0, percent=1.0)],
        rounding_rule=RoundingRule(unit_minutes=15, method='nearest'),
        feriepengesats=0.12
    )
    # Evening shift with an allowance from 18–21 of 25 kr per hour
    evening_allowance = Allowance(
        type_='kr_per_time', value=25.0, from_time='18:00', to_time='21:00', days=None
    )
    templates['E'] = ShiftTemplate(
        code='E',
        employer='Demo Co.',
        standard_start='16:00',
        standard_end='22:00',
        unpaid_pause_min=30,
        base_rate=200.0,
        allowances=[evening_allowance],
        overtime_rules=[OvertimeRule(threshold_hours=8.0, percent=0.5)],
        rounding_rule=RoundingRule(unit_minutes=15, method='nearest'),
        feriepengesats=0.12
    )
    # Sunday/holiday shift with 100% allowance all day
    sunday_allowance = Allowance(
        type_='prosent', value=1.0, from_time='00:00', to_time='24:00', days=[6]  # Sunday
    )
    templates['S'] = ShiftTemplate(
        code='S',
        employer='Demo Co.',
        standard_start='08:00',
        standard_end='16:00',
        unpaid_pause_min=30,
        base_rate=200.0,
        allowances=[sunday_allowance],
        overtime_rules=[OvertimeRule(threshold_hours=8.0, percent=0.5),
                        OvertimeRule(threshold_hours=10.0, percent=1.0)],
        rounding_rule=RoundingRule(unit_minutes=15, method='nearest'),
        feriepengesats=0.12
    )
    return templates


def demo() -> None:
    """Run a demonstration of the wage calculation engine."""
    manager = WageManager()
    # Load templates
    for code, template in create_demo_templates().items():
        manager.add_template(template)

    # Record some shifts
    manager.add_shift(Shift(date=date(2025, 8, 1), start_time='08:00', end_time='16:00', template_code='D'))
    manager.add_shift(Shift(date=date(2025, 8, 2), start_time='16:00', end_time='22:00', template_code='E'))
    manager.add_shift(Shift(date=date(2025, 8, 3), start_time='08:00', end_time='16:00', template_code='S'))
    # A shift crossing midnight with overtime and allowances
    manager.add_shift(Shift(date=date(2025, 8, 4), start_time='20:00', end_time='04:00', template_code='E'))

    # Generate and print the report
    report = manager.monthly_report()
    print(report)

    # Optionally export to CSV
    # manager.export_csv('august_report.csv')


if __name__ == '__main__':
    demo()
