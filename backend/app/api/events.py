from typing import List
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_session
from app.models import Event, User
from app.schemas.content import EventCreate, EventRead
from app.api.deps import require_admin, get_current_active_user

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=EventRead)
def create_event(
    event: EventCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    event_data = event.dict()
    # Serialize JSON fields
    if event_data.get("target_departments") is not None:
        event_data["target_departments"] = json.dumps(event_data["target_departments"])
    else:
        event_data["target_departments"] = json.dumps([])

    if event_data.get("eligibility") is not None:
        event_data["eligibility"] = json.dumps(event_data["eligibility"])
    else:
        event_data["eligibility"] = json.dumps([])

    if event_data.get("attachments") is not None:
        event_data["attachments"] = json.dumps(event_data["attachments"])
    else:
        event_data["attachments"] = json.dumps([])

    db_event = Event(**event_data)
    db_event.created_by = current_user.id
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    
    # Deserialize for response
    # We can technically just return db_event if Pydantic ignores type mismatch or we correct it,
    # but best to be safe. Actually, db_event attributes are strings now.
    # To return EventRead (which expects List), we need to set them back to lists on the object or dict.
    # However, since session.refresh re-loads from DB, they are strings.
    # Pydantic orm_mode might complain. Let's fix it for response.
    # Actually, returning the input `event` merged with IDs is easier, but let's stick to parsing db_event.
    return parse_event_for_read(db_event)

@router.get("/", response_model=List[EventRead])
def read_events(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Only return global events (where club_id is None)
    events = session.execute(select(Event).where(Event.club_id.is_(None))).scalars().all()
    
    # Filter based on User Branch and Semester (Year)
    # If Admin/Faculty, show all? Or maybe just Student filtering.
    # User request: "selecting the branch should make the event appear to specific branch people only"
    
    parsed_events = [parse_event_for_read(e) for e in events]
    
    if current_user.role == 'admin':
        return parsed_events
        
    filtered_events = []
    
    # Helper to determine year from semester (approx)
    # 1-2 = 1st Year, 3-4 = 2nd Year, 5-6 = 3rd Year, 7-8 = 4th Year
    def get_user_year(sem: str):
        try:
            s = int(sem)
            return str((s - 1) // 2 + 1) # "1", "2", "3", "4"
        except:
            return "1" # Fallback
            
    user_year = get_user_year(current_user.semester) if current_user.semester else None
    
    for evt in parsed_events:
        # 1. Check Branch
        # target_departments is List[str] e.g. ["CSE", "ECE"] or Empty (All)
        branch_match = True
        if evt['target_departments'] and len(evt['target_departments']) > 0:
            if not current_user.branch or current_user.branch not in evt['target_departments']:
                branch_match = False
        
        # 2. Check Year (eligibility field used for Year/Sem)
        # eligibility is List[str] e.g. ["1", "3"] (Years) or Empty (All)
        year_match = True
        if evt['eligibility'] and len(evt['eligibility']) > 0:
             if not user_year or user_year not in evt['eligibility']:
                 year_match = False

        if branch_match and year_match:
            filtered_events.append(evt)
            
    return filtered_events

def parse_event_for_read(db_event: Event) -> EventRead:
    # Convert SQLAlchemy model to dict to avoid mutating DB object state for session
    # or just parse the fields we know are JSON.
    # Since we need to return EventRead, let's construct it.
    
    # Helper to safe load json
    def safe_load(val):
        if not val: return []
        try:
            return json.loads(val)
        except:
            return []

    # We manually map fields that need parsing. 
    # For others, we rely on Pydantic to extract from the db_event object (orm_mode).
    # But db_event has string for target_departments. 
    # So we construct a dict.
    
    event_dict = {c.name: getattr(db_event, c.name) for c in db_event.__table__.columns}
    
    event_dict['target_departments'] = safe_load(db_event.target_departments)
    event_dict['eligibility'] = safe_load(db_event.eligibility)
    event_dict['attachments'] = safe_load(db_event.attachments)
    
    # Handle relationships/computeds if any (registration_count)
    # EventRead has registration_count. 
    # The DB model might not have it as a column but as a property or we count it.
    # For now, let's assume default or if model has query.
    # The original schema had registration_count: int = 0.
    # We should probably count registrations.
    event_dict['registration_count'] = len(db_event.registrations) if db_event.registrations else 0
    
    # id is needed
    event_dict['id'] = db_event.id
    
    return event_dict
