from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.wage_settings import WageSettings
from ..schemas.auth import LoginRequest, Token
from ..schemas.user import UserCreate, UserOut
from ..utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if not data.gdpr_accepted:
        raise HTTPException(400, "Du må godta personvernerklæringen")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "E-post er allerede registrert")
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        gdpr_accepted=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()
    # Create default wage settings
    ws = WageSettings(user_id=user.id)
    db.add(ws)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Feil e-post eller passord")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Konto er deaktivert")
    token = create_access_token(user.id, user.is_admin)
    return Token(access_token=token, token_type="bearer", is_admin=user.is_admin)
