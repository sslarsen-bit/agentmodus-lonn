from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.shift_template import ShiftTemplate
from ..schemas.shift_template import ShiftTemplateCreate, ShiftTemplateUpdate, ShiftTemplateOut
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/api/shift-templates", tags=["shift-templates"])


@router.get("", response_model=List[ShiftTemplateOut])
def list_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ShiftTemplate).filter(ShiftTemplate.user_id == current_user.id).all()


@router.post("", response_model=ShiftTemplateOut, status_code=201)
def create_template(
    data: ShiftTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = ShiftTemplate(user_id=current_user.id, **data.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.patch("/{template_id}", response_model=ShiftTemplateOut)
def update_template(
    template_id: int,
    data: ShiftTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = db.query(ShiftTemplate).filter(ShiftTemplate.id == template_id, ShiftTemplate.user_id == current_user.id).first()
    if not t:
        raise HTTPException(404, "Vaktkode ikke funnet")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(t, field, value)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = db.query(ShiftTemplate).filter(ShiftTemplate.id == template_id, ShiftTemplate.user_id == current_user.id).first()
    if not t:
        raise HTTPException(404, "Vaktkode ikke funnet")
    db.delete(t)
    db.commit()
    return {"detail": "Slettet"}
