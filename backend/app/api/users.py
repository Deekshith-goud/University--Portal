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
    semester: Optional[int] = None

router = APIRouter(prefix="", tags=["users"])

# ... (Dashboard endpoint skipped in replace context, ensure it remains if contiguous, but here we are targeting UserUpdate class definition and update_user_me function which are far apart. Better to use multi_replace or just update UserUpdate first then function.
# Let's check lines. UserUpdate is at line 19. update_user_me is at line 74.
# I will use multi_replace.

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
        semester=None, # Explicitly None for non-students
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
    if user_update.semester:
        current_user.semester = user_update.semester
    if user_update.password:
        current_user.password_hash = get_password_hash(user_update.password)
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user
