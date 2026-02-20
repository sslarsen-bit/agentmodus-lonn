"""
Lønns- og Vaktapp – FastAPI backend entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, users, wage_settings, shift_templates, shifts, calculator, import_data, export, admin
from .config import settings


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_admin():
    """Create the default admin user if it does not exist."""
    from sqlalchemy.orm import Session
    from .models.user import User
    from .utils.security import hash_password

    db = Session(bind=engine)
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not existing:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                name="Administrator",
                is_admin=True,
                is_active=True,
                is_verified=True,
                gdpr_accepted=True,
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()


app = FastAPI(
    title="Lønns- og Vaktapp API",
    description="Backend API for lønns- og vaktregistrering",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    create_tables()
    seed_admin()


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(wage_settings.router)
app.include_router(shift_templates.router)
app.include_router(shifts.router)
app.include_router(calculator.router)
app.include_router(import_data.router)
app.include_router(export.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
