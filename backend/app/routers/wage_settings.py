from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.wage_settings import WageSettings
from ..schemas.wage_settings import WageSettingsOut, WageSettingsUpdate
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/api/wage-settings", tags=["wage-settings"])


def _get_or_create_ws(user_id: int, db: Session) -> WageSettings:
    ws = db.query(WageSettings).filter(WageSettings.user_id == user_id).first()
    if not ws:
        ws = WageSettings(user_id=user_id)
        db.add(ws)
        db.commit()
        db.refresh(ws)
    return ws


@router.get("", response_model=WageSettingsOut)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_or_create_ws(current_user.id, db)


@router.patch("", response_model=WageSettingsOut)
def update_settings(
    data: WageSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ws = _get_or_create_ws(current_user.id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ws, field, value)
    db.commit()
    db.refresh(ws)
    return ws
