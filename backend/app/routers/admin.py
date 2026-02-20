from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.shift import Shift
from ..schemas.user import UserAdminOut
from ..middleware.auth import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()  # noqa: E712
    total_shifts = db.query(func.count(Shift.id)).scalar()
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_shifts": total_shifts,
    }


@router.get("/users", response_model=List[UserAdminOut])
def list_users(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    q = db.query(User).filter(User.is_admin == False)  # noqa: E712
    if search:
        like = f"%{search}%"
        q = q.filter(
            (User.name.ilike(like)) | (User.email.ilike(like)) | (User.workplace.ilike(like))
        )
    return q.order_by(User.created_at.desc()).all()


@router.get("/users/{user_id}", response_model=UserAdminOut)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Bruker ikke funnet")
    return user


@router.patch("/users/{user_id}/deactivate", response_model=UserAdminOut)
def deactivate_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Bruker ikke funnet")
    if user.id == admin.id:
        raise HTTPException(400, "Kan ikke deaktivere deg selv")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/activate", response_model=UserAdminOut)
def activate_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Bruker ikke funnet")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Bruker ikke funnet")
    if user.id == admin.id:
        raise HTTPException(400, "Kan ikke slette deg selv")
    db.delete(user)
    db.commit()
    return {"detail": "Bruker slettet"}
