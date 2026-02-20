from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models.user import User
from ..models.shift import Shift
from ..models.wage_settings import WageSettings
from ..middleware.auth import get_current_user
from ..services.import_service import parse_excel, parse_csv
from ..services.wage_engine import calculate_shift

router = APIRouter(prefix="/api/import", tags=["import"])


def _get_ws(user_id: int, db: Session) -> WageSettings:
    ws = db.query(WageSettings).filter(WageSettings.user_id == user_id).first()
    return ws or WageSettings(user_id=user_id)


@router.post("/preview")
async def preview_import(
    file: UploadFile = File(...),
    name_filter: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    fname = file.filename.lower()
    if fname.endswith(".xlsx"):
        shifts, errors = parse_excel(content, name_filter)
    elif fname.endswith(".csv"):
        shifts, errors = parse_csv(content, name_filter)
    else:
        raise HTTPException(400, "Støttet filformat: .xlsx, .csv")
    return {"shifts": shifts, "errors": errors, "count": len(shifts)}


@router.post("/confirm")
async def confirm_import(
    file: UploadFile = File(...),
    name_filter: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    fname = file.filename.lower()
    if fname.endswith(".xlsx"):
        shifts_data, errors = parse_excel(content, name_filter)
    elif fname.endswith(".csv"):
        shifts_data, errors = parse_csv(content, name_filter)
    else:
        raise HTTPException(400, "Støttet filformat: .xlsx, .csv")

    ws = _get_ws(current_user.id, db)
    created = 0
    for sd in shifts_data:
        shift = Shift(user_id=current_user.id, **sd)
        result = calculate_shift(shift, ws)
        for k, v in result.items():
            setattr(shift, k, v)
        db.add(shift)
        created += 1
    db.commit()
    return {"imported": created, "errors": errors}
