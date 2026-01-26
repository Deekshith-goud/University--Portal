from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.core.database import get_session
from app.core.security import get_password_hash
from app.models import User, Assignment, Submission, Event, Announcement
from app.api.deps import require_admin, get_current_active_user, get_current_user
from app.schemas.auth import UserOut

class AdminUserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str # faculty, admin
    branch: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    year: Optional[int] = None
    branch: Optional[str] = None
    section: Optional[str] = None

router = APIRouter(prefix="", tags=["users"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    stats = {}
    if current_user.role == "admin":
        stats["users"] = session.query(func.count(User.id)).scalar()
        stats["events"] = session.query(func.count(Event.id)).scalar()
        stats["announcements"] = session.query(func.count(Announcement.id)).scalar()
    elif current_user.role == "faculty":
        stats["assignments_created"] = session.query(func.count(Assignment.id)).filter(Assignment.faculty_id == current_user.id).scalar()
        stats["submissions_received"] = 0 
    elif current_user.role == "student":
        stats["pending_assignments"] = 0 
        
    return stats

@router.get("/users", response_model=List[UserOut],  dependencies=[Depends(require_admin)])
def read_users(session: Session = Depends(get_session), skip: int = 0, limit: int = 100):
    users = session.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/users/admin/create", response_model=UserOut, dependencies=[Depends(require_admin)])
def create_user_by_admin(user_in: AdminUserCreate, session: Session = Depends(get_session)):
    # Check if email exists
    existing_user = session.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user_in.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=400, detail="Admin can only create Faculty or Admin accounts.")

    hashed = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed,
        role=user_in.role,
        branch=user_in.branch, # Faculty might have branch
        year=None, # Explicitly None for non-students
        is_active=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.put("/users/me", response_model=UserOut)
def update_user_me(user_update: UserUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    if user_update.name:
        current_user.name = user_update.name
    if user_update.email:
        current_user.email = user_update.email
    if user_update.year:
        current_user.year = user_update.year
    if user_update.branch:
        current_user.branch = user_update.branch
    if user_update.section:
        current_user.section = user_update.section
    if user_update.password:
        current_user.password_hash = get_password_hash(user_update.password)
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user
