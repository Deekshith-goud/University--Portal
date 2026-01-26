from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    username: str # OAuth2PasswordRequestForm uses 'username' for email often, but we can support strict email too
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    otp: str
    # Student specific (faculties/admins created by admin endpoint)
    registration_number: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    year: Optional[int] = 1 # Default 1 for students if not specified

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    branch: Optional[str] = None
    section: Optional[str] = None
    year: Optional[int] = None
    registration_number: Optional[str] = None
    created_at: Optional[datetime] = None
    events_participated_count: Optional[int] = 0

    class Config:
        from_attributes = True

class OTPRequest(BaseModel):
    email: str
    reason: str = "login" # "signup", "reset", "login"

class PasswordReset(BaseModel):
    email: str
    otp: str
    new_password: str

class OTPVerify(BaseModel):
    email: str
    otp: str
