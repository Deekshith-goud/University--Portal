from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_session
from app.models import Achievement, User, Event
from app.schemas.achievements import AchievementCreate, AchievementOut
from app.api.auth import get_current_user

router = APIRouter(
    prefix="/achievements",
    tags=["Achievements"]
)

# Helper to enrich response
def enrich_achievement(ach, user=None, event=None):
    out = AchievementOut.model_validate(ach)
    
    # User Details
    student = user or ach.user
    if student:
        out.student_name = student.name
        out.student_details = {
            "registration_number": student.registration_number,
            "branch": student.branch,
            "year": student.year,
            "section": student.section
        }
    
    # Event Title
    evt = event or ach.event
    if evt:
        out.event_title = evt.title
    elif ach.external_event_name:
        out.event_title = ach.external_event_name
        
    return out

@router.post("/", response_model=AchievementOut)
def create_achievement(
    achievement: AchievementCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to create achievements")

    # Validate Event if provided
    if achievement.event_id:
        event = db.query(Event).filter(Event.id == achievement.event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
            
    # Validate Student
    student = db.query(User).filter(User.id == achievement.user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check duplicates? logic slightly complex now with null events, let's keep it simple:
    # If event_id is present, check uniqueness per student.
    if achievement.event_id:
        existing = db.query(Achievement).filter(
            Achievement.event_id == achievement.event_id,
            Achievement.user_id == achievement.user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Student already has an achievement for this event")

    new_achievement = Achievement(
        event_id=achievement.event_id,
        user_id=achievement.user_id,
        title=achievement.title,
        description=achievement.description,
        category=achievement.category,
        badge=achievement.badge,
        image_url=achievement.image_url,
        certificate_url=achievement.certificate_url,
        external_event_name=achievement.external_event_name
    )
    db.add(new_achievement)
    db.commit()
    db.refresh(new_achievement)
    
    return enrich_achievement(new_achievement, user=student)

@router.get("/all", response_model=List[AchievementOut])
def get_all_achievements(
    category: Optional[str] = None,
    event_id: Optional[int] = None,
    db: Session = Depends(get_session)
):
    query = db.query(Achievement)
    
    if category:
        query = query.filter(Achievement.category == category)
    if event_id:
        query = query.filter(Achievement.event_id == event_id)
        
    # Sort by latest
    achievements = query.order_by(Achievement.created_at.desc()).all()
    
    return [enrich_achievement(ach) for ach in achievements]


@router.get("/event/{event_id}", response_model=List[AchievementOut])
def get_event_achievements(
    event_id: int,
    db: Session = Depends(get_session)
):
    achievements = db.query(Achievement).filter(Achievement.event_id == event_id).all()
    return [enrich_achievement(ach) for ach in achievements]

@router.get("/my", response_model=List[AchievementOut])
def get_my_achievements(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    achievements = db.query(Achievement).filter(Achievement.user_id == current_user.id).order_by(Achievement.created_at.desc()).all()
    return [enrich_achievement(ach, user=current_user) for ach in achievements]

@router.delete("/{id}")
def delete_achievement(
    id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete achievements")
        
    achievement = db.query(Achievement).filter(Achievement.id == id).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
        
    db.delete(achievement)
    db.commit()
    return {"message": "Achievement deleted successfully"}
