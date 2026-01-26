from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_session
from app.models import Announcement, User
from app.schemas.content import AnnouncementCreate, AnnouncementRead
from app.api.deps import require_admin, get_current_active_user

router = APIRouter(prefix="/announcements", tags=["announcements"])

@router.post("/", response_model=AnnouncementRead)
def create_announcement(
    announcement: AnnouncementCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    db_announcement = Announcement(**announcement.dict())
    db_announcement.created_by = current_user.id
    session.add(db_announcement)
    session.commit()
    session.refresh(db_announcement)
    return db_announcement

@router.get("/", response_model=List[AnnouncementRead])
def read_announcements(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Base query
    query = select(Announcement)
    
    # If user is admin, show all (or maybe filter in frontend, but backend safest is all)
    if current_user.role == "admin":
        pass # Admin sees all
    else:
        # For students/faculty, filter by target_departments
        # Logic: Show if target_departments is Empty/Null (All) OR contains user.branch
        # Since target_departments is TEXT/JSON, we likely need to do a python-side filter 
        # or robust JSON query. For simplicity with SQLite/Generic, we can filter in python 
        # if dataset is small, or use simple string contains if structure is simple.
        # Let's simple filter in Python for now as MVP.
        pass

    announcements = session.execute(query).scalars().all()
    
    # Python-side filtering for complex JSON logic (safer for MVP cross-db)
    if current_user.role != "admin":
        filtered_announcements = []
        for ann in announcements:
            targets = []
            if ann.target_departments:
                import json
                try:
                    targets = json.loads(ann.target_departments)
                except:
                    targets = [] # content might be malformed or simple string
            
            # If no specific target, it's for everyone.
            # If user has no branch (e.g. fresh account), maybe show all or none? stick to All.
            if not targets:
                filtered_announcements.append(ann)
            elif current_user.branch and current_user.branch in targets:
                filtered_announcements.append(ann)
        
        return filtered_announcements
        
    return announcements
