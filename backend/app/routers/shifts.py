from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.shift import Shift
from ..models.shift_template import ShiftTemplate
from ..models.wage_settings import WageSettings
from ..schemas.shift import ShiftCreate, ShiftUpdate, ShiftOut
from ..middleware.auth import get_current_user
from ..services.wage_engine import calculate_shift

router = APIRouter(prefix="/api/shifts", tags=["shifts"])


def _get_ws(user_id: int, db: Session) -> WageSettings:
    ws = db.query(WageSettings).filter(WageSettings.user_id == user_id).first()
    return ws or WageSettings(user_id=user_id)


def _recalculate(shift: Shift, ws: WageSettings):
    result = calculate_shift(shift, ws)
    for k, v in result.items():
        setattr(shift, k, v)


@router.get("", response_model=List[ShiftOut])
def list_shifts(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Shift).filter(Shift.user_id == current_user.id)
    if year and month:
        prefix = f"{year}-{month:02d}"
        q = q.filter(Shift.date.startswith(prefix))
    elif year:
        q = q.filter(Shift.date.startswith(str(year)))
    return q.order_by(Shift.date, Shift.start_time).all()


@router.post("", response_model=ShiftOut, status_code=201)
def create_shift(
    data: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ws = _get_ws(current_user.id, db)
    shift = Shift(user_id=current_user.id, **data.model_dump())
    # If template supplied, apply defaults for pause if not set
    if data.template_id:
        tpl = db.query(ShiftTemplate).filter(ShiftTemplate.id == data.template_id).first()
        if tpl and shift.pause_min == 0:
            shift.pause_min = tpl.pause_min
    _recalculate(shift, ws)
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.get("/{shift_id}", response_model=ShiftOut)
def get_shift(shift_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shift = db.query(Shift).filter(Shift.id == shift_id, Shift.user_id == current_user.id).first()
    if not shift:
        raise HTTPException(404, "Vakt ikke funnet")
    return shift


@router.patch("/{shift_id}", response_model=ShiftOut)
def update_shift(
    shift_id: int,
    data: ShiftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shift = db.query(Shift).filter(Shift.id == shift_id, Shift.user_id == current_user.id).first()
    if not shift:
        raise HTTPException(404, "Vakt ikke funnet")
    ws = _get_ws(current_user.id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(shift, field, value)
    _recalculate(shift, ws)
    db.commit()
    db.refresh(shift)
    return shift


@router.delete("/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shift = db.query(Shift).filter(Shift.id == shift_id, Shift.user_id == current_user.id).first()
    if not shift:
        raise HTTPException(404, "Vakt ikke funnet")
    db.delete(shift)
    db.commit()
    return {"detail": "Slettet"}
