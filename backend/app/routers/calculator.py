from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.shift import Shift
from ..models.wage_settings import WageSettings
from ..models.month_summary import MonthSummary
from ..schemas.month_summary import MonthSummaryOut, MonthSummaryCreate
from ..middleware.auth import get_current_user
from ..services.wage_engine import calculate_month
from ..services.holiday_service import get_holidays_for_month
from typing import List

router = APIRouter(prefix="/api/calculator", tags=["calculator"])


def _get_ws(user_id: int, db: Session) -> WageSettings:
    ws = db.query(WageSettings).filter(WageSettings.user_id == user_id).first()
    return ws or WageSettings(user_id=user_id)


@router.get("/month")
def calculate(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ws = _get_ws(current_user.id, db)
    prefix = f"{year}-{month:02d}"
    shifts = db.query(Shift).filter(
        Shift.user_id == current_user.id,
        Shift.date.startswith(prefix)
    ).all()
    result = calculate_month(shifts, ws)
    holidays = get_holidays_for_month(year, month)
    return {"year": year, "month": month, "shifts_count": len(shifts), "holidays": holidays, **result}


@router.post("/month/save", response_model=MonthSummaryOut)
def save_month(
    data: MonthSummaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ws = _get_ws(current_user.id, db)
    prefix = f"{data.year}-{data.month:02d}"
    shifts = db.query(Shift).filter(
        Shift.user_id == current_user.id,
        Shift.date.startswith(prefix)
    ).all()
    result = calculate_month(shifts, ws)

    existing = db.query(MonthSummary).filter(
        MonthSummary.user_id == current_user.id,
        MonthSummary.year == data.year,
        MonthSummary.month == data.month,
    ).first()

    if existing and existing.is_locked:
        raise HTTPException(400, "Måneden er låst og kan ikke endres")

    if existing:
        for k, v in result.items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    summary = MonthSummary(
        user_id=current_user.id,
        year=data.year,
        month=data.month,
        **result,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary


@router.get("/summaries", response_model=List[MonthSummaryOut])
def list_summaries(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MonthSummary).filter(MonthSummary.user_id == current_user.id).order_by(
        MonthSummary.year.desc(), MonthSummary.month.desc()
    ).all()


@router.post("/summaries/{summary_id}/lock", response_model=MonthSummaryOut)
def lock_summary(summary_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = db.query(MonthSummary).filter(MonthSummary.id == summary_id, MonthSummary.user_id == current_user.id).first()
    if not s:
        raise HTTPException(404, "Sammendrag ikke funnet")
    s.is_locked = True
    db.commit()
    db.refresh(s)
    return s
