from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, Unicode
import json

from app.core.database import get_session
from app.models import Announcement, User
from app.api.deps import get_current_active_user
from app.schemas.content import AnnouncementCreate, AnnouncementRead

router = APIRouter(prefix="/college/announcements", tags=["college-announcements"])

# Check if user is Staff (Admin or Faculty)
def is_staff(user: User):
    return user.role in ["admin", "faculty"]

@router.post("", response_model=AnnouncementRead)
def create_college_announcement(
    announcement_in: AnnouncementCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    if not is_staff(current_user):
        raise HTTPException(status_code=403, detail="Only Faculty/Admin can post official announcements")
    
    # Force club_id to None for Official Announcements
    data = announcement_in.dict()
    data["club_id"] = None
    
    # Handle JSON fields serialization
    if "attachments" in data and data["attachments"]:
         data["attachments"] = json.dumps(data["attachments"])
    else:
         data["attachments"] = None

    if "target_departments" in data and data["target_departments"]:
         data["target_departments"] = json.dumps(data["target_departments"])
    else:
         data["target_departments"] = None
         
    if "images" in data and data["images"]:
         data["images"] = json.dumps(data["images"])
    else:
        data["images"] = None

    db_announcement = Announcement(**data)
    db_announcement.created_by = current_user.id
    
    session.add(db_announcement)
    session.commit()
    session.refresh(db_announcement)
    
    # Construct response manually to handle JSON fields
    response_dict = db_announcement.__dict__.copy()
    try:
        response_dict['attachments'] = json.loads(db_announcement.attachments) if db_announcement.attachments else []
        response_dict['target_departments'] = json.loads(db_announcement.target_departments) if db_announcement.target_departments else []
        response_dict['images'] = json.loads(db_announcement.images) if db_announcement.images else []
    except:
        pass
        
    return response_dict

@router.get("", response_model=List[AnnouncementRead])
def read_college_announcements(
    category: Optional[str] = None,
    department: Optional[str] = None,
    limit: int = 50,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    query = session.query(Announcement).filter(Announcement.club_id == None)
    
    if category:
        query = query.filter(Announcement.category == category)
        
    # Department filter logic:
    # If a department is specified, show announcements that target ALL (None) or target that specific dept
    if department:
        # Note: querying JSON with LIKE is a simple hack. Ideally use JSON operators if DB supports it reliably.
        # For simplicity: filter in python or use simple text search if column is Text
        pass 
        
    # Sort: Pinned first, then Newest
    query = query.order_by(desc(Announcement.is_pinned), desc(Announcement.published_at))
    
    announcements = query.limit(limit).all()
    
    results = []
    current_sem_str = str(current_user.semester) if current_user.semester else None

    for ann in announcements:
        # Check Department visibility
        target_depts = []
        try:
             target_depts = json.loads(ann.target_departments) if ann.target_departments else []
        except:
             pass
        
        # Check Semester visibility
        target_sems = []
        try:
             target_sems = json.loads(ann.target_semesters) if ann.target_semesters else []
        except:
             pass

        # Filter for Students
        if current_user.role == "student":
             # 1. Department Filter
             if department and target_depts:
                 if department not in target_depts:
                     continue
             # 2. Semester Filter
             if target_sems:
                 if current_sem_str not in target_sems:
                     continue

        # Convert to Read Schema
        ann_dict = ann.__dict__.copy()
        try:
            ann_dict['attachments'] = json.loads(ann.attachments) if ann.attachments else []
            ann_dict['target_departments'] = target_depts
            ann_dict['target_semesters'] = target_sems
            ann_dict['images'] = json.loads(ann.images) if ann.images else []
        except:
            ann_dict['attachments'] = []
            ann_dict['target_departments'] = []
            ann_dict['target_semesters'] = []
            ann_dict['images'] = []
            
        results.append(ann_dict)
        
    return results

@router.delete("/{announcement_id}")
def delete_college_announcement(
    announcement_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    if not is_staff(current_user):
        raise HTTPException(status_code=403, detail="Permission denied")
        
    ann = session.query(Announcement).filter(Announcement.id == announcement_id, Announcement.club_id == None).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    session.delete(ann)
    session.commit()
    return {"message": "Deleted successfully"}
