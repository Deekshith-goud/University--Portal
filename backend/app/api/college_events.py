from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import json
from datetime import datetime

from app.core.database import get_session
from app.models import Event, EventRegistration, User
from app.api.deps import get_current_active_user
from app.schemas.content import EventCreate, EventRead, EventRegistrationCreate, EventRegistrationRead

router = APIRouter(prefix="/college/events", tags=["college-events"])

def is_staff(user: User):
    return user.role in ["admin", "faculty"]

@router.post("", response_model=EventRead)
def create_college_event(
    event_in: EventCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    if not is_staff(current_user):
         raise HTTPException(status_code=403, detail="Only Faculty/Admin can create college events")
    
    data = event_in.dict()
    data["club_id"] = None
    
    # Handle JSON fields
    # Handle JSON fields
    if data.get("eligibility") is not None:
        data["eligibility"] = json.dumps(data["eligibility"])
    else:
        data["eligibility"] = json.dumps([])

    if data.get("attachments") is not None:
        data["attachments"] = json.dumps(data["attachments"])
    else:
        data["attachments"] = json.dumps([])

    if data.get("target_departments") is not None:
        data["target_departments"] = json.dumps(data["target_departments"])
    else:
        data["target_departments"] = json.dumps([])

    db_event = Event(**data)
    db_event.created_by = current_user.id
    
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    
    # Manually construct response
    response_dict = db_event.__dict__.copy()
    try:
        response_dict['eligibility'] = json.loads(db_event.eligibility) if db_event.eligibility else []
        response_dict['attachments'] = json.loads(db_event.attachments) if db_event.attachments else []
        response_dict['target_departments'] = json.loads(db_event.target_departments) if db_event.target_departments else []
    except:
        pass
        
    return response_dict

@router.get("", response_model=List[EventRead])
def read_college_events(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Fetch events where club_id is NULL (College Events)
    events = session.query(Event).filter(Event.club_id == None).order_by(Event.date).all()
    
    results = []
    current_sem_str = str(current_user.semester) if current_user.semester else None
    
    for event in events:
        # 1. Eligibility Filter (Semesters)
        try:
             eligibility_list = json.loads(event.eligibility) if event.eligibility else []
        except:
             eligibility_list = []
        
        # If student and eligibility is restricted (not empty), check if semester matches
        if current_user.role == "student" and eligibility_list:
            # Assume eligibility_list contains strings of semesters e.g. ["1", "3", "5"]
            if current_sem_str not in eligibility_list:
                continue

        # Count registrations
        reg_count = session.query(func.count(EventRegistration.id)).filter(EventRegistration.event_id == event.id).scalar()
        is_registered = session.query(EventRegistration).filter(
            EventRegistration.event_id == event.id, 
            EventRegistration.student_id == current_user.id
        ).first() is not None
        
        event_dict = event.__dict__.copy()
        event_dict['registration_count'] = reg_count or 0
        event_dict['is_registered'] = is_registered
        
        try:
             event_dict['eligibility'] = eligibility_list
             event_dict['attachments'] = json.loads(event.attachments) if event.attachments else []
             event_dict['target_departments'] = json.loads(event.target_departments) if event.target_departments else []
        except:
             event_dict['eligibility'] = []
             event_dict['attachments'] = []
             event_dict['target_departments'] = []

        results.append(event_dict)
    
    return results

@router.post("/{event_id}/register", response_model=EventRegistrationRead)
def register_for_college_event(
    event_id: int,
    registration_in: EventRegistrationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    event = session.query(Event).filter(Event.id == event_id).first()
    if not event or event.club_id is not None:
        raise HTTPException(status_code=404, detail="College Event not found")
        
    # Check 1: Is Open?
    if not event.is_open:
        raise HTTPException(status_code=400, detail="Registration is closed for this event")
        
    # Check 2: Deadline?
    if event.registration_deadline and datetime.utcnow() > event.registration_deadline:
        raise HTTPException(status_code=400, detail="Registration deadline has passed")
        
    # Check 3: Already Registered?
    existing = session.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.student_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already registered")

    # Construct Registration
    reg_data = registration_in.dict()
    
    # Force auto-fields from User Profile if not provided
    if not reg_data.get('student_email'):
        reg_data['student_email'] = current_user.email
        
    # Logic: if team event, ensure team details
    if event.participation_type == 'team':
        if not reg_data.get('team_name'):
             raise HTTPException(status_code=400, detail="Team Name is required for team events")
        # Validate team size if possible (min/max)
        
    try:
        db_reg = EventRegistration(**reg_data)
        db_reg.event_id = event_id
        db_reg.student_id = current_user.id
        db_reg.student_name = reg_data.get('student_name') or current_user.name
        # Populate other user details
        db_reg.registration_number = reg_data.get('registration_number') or current_user.registration_number
        db_reg.branch = reg_data.get('branch') or current_user.branch
        db_reg.section = reg_data.get('section') or current_user.section
        
        session.add(db_reg)
        session.commit()
        session.refresh(db_reg)
    except Exception as e:
        import traceback
        traceback.print_exc()
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Registration Error: {str(e)}")
    return db_reg

@router.delete("/{event_id}")
def delete_college_event(
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    if not is_staff(current_user):
        raise HTTPException(status_code=403, detail="Permission denied")
        
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    session.delete(event)
    session.commit()
    return {"message": "Deleted successfully"}

@router.get("/{event_id}/registrations", response_model=List[EventRegistrationRead])
def get_event_registrations(
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    if not is_staff(current_user):
        raise HTTPException(status_code=403, detail="Permission denied")
        
    registrations = session.query(EventRegistration).filter(EventRegistration.event_id == event_id).all()
    return registrations
