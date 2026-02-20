from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool


class TokenData(BaseModel):
    user_id: Optional[int] = None
    is_admin: bool = False
