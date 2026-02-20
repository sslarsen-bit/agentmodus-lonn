from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models.user import User
from ..models.shift import Shift
from ..models.month_summary import MonthSummary
from ..middleware.auth import get_current_user
from ..services.export_service import generate_csv, generate_excel, generate_pdf

router = APIRouter(prefix="/api/export", tags=["export"])


def _get_shifts(user_id: int, year: int, month: int, db: Session):
    prefix = f"{year}-{month:02d}"
    return db.query(Shift).filter(
        Shift.user_id == user_id,
        Shift.date.startswith(prefix)
    ).order_by(Shift.date, Shift.start_time).all()


def _get_summary(user_id: int, year: int, month: int, db: Session):
    return db.query(MonthSummary).filter(
        MonthSummary.user_id == user_id,
        MonthSummary.year == year,
        MonthSummary.month == month,
    ).first()


@router.get("/csv")
def export_csv(
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shifts = _get_shifts(current_user.id, year, month, db)
    data = generate_csv(shifts, current_user)
    filename = f"vakter_{year}_{month:02d}.csv"
    return Response(
        content=data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/excel")
def export_excel(
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shifts = _get_shifts(current_user.id, year, month, db)
    summary = _get_summary(current_user.id, year, month, db)
    data = generate_excel(shifts, current_user, summary)
    filename = f"vakter_{year}_{month:02d}.xlsx"
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/pdf")
def export_pdf(
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shifts = _get_shifts(current_user.id, year, month, db)
    summary = _get_summary(current_user.id, year, month, db)
    data = generate_pdf(shifts, current_user, summary)
    filename = f"vakter_{year}_{month:02d}.pdf"
    return Response(
        content=data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
