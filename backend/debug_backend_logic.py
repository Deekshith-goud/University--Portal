from app.core.database import SessionLocal
from app.models import Event, User, EventRegistration
from sqlalchemy import func
import json
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict

# --- MOCK SCHEMAS (To simulate Pydantic) ---
class EventBase(BaseModel):
    title: str
    description: str
    date: datetime
    location: Optional[str] = None
    image_banner: Optional[str] = None
    requires_registration: bool = False
    event_type: Optional[str] = "Event"
    participation_type: Optional[str] = "individual"
    min_team_size: Optional[int] = 1
    max_team_size: Optional[int] = 1
    registration_deadline: Optional[datetime] = None
    is_open: bool = True
    eligibility: Optional[List[str]] = None
    venue: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    image_poster: Optional[str] = None
    attachments: Optional[List[Dict[str, str]]] = []

class EventRead(EventBase):
    id: int
    created_by: Optional[int] = None # We made this optional
    registration_count: int = 0
    is_registered: bool = False
    
    class Config:
        from_attributes = True

# --- LOGIC SIMULATION ---
session = SessionLocal()

# 1. Get a Test User (Student)
student = session.query(User).filter(User.role == "student").first()
if not student:
    print("FATAL: No student user found to test with.")
    exit()

print(f"--- TESTING AS USER: {student.name} (ID: {student.id}, Sem: {student.semester}) ---")
current_sem_str = str(student.semester) if student.semester else None

# 2. Query Events
events = session.query(Event).filter(Event.club_id == None).order_by(Event.date).all()
print(f"Found {len(events)} raw events in DB.")

results = []
for event in events:
    print(f"\n[Checking Event ID {event.id}: {event.title}]")
    
    # Logic Copy from college_events.py
    try:
        eligibility_list = json.loads(event.eligibility) if event.eligibility else []
    except Exception as e:
        print(f"  -> ERROR parsing eligibility: {e}")
        eligibility_list = []
    
    print(f"  -> Eligibility: {eligibility_list}")
    
    # Filter Logic
    if student.role == "student" and eligibility_list:
        if current_sem_str not in eligibility_list:
            print(f"  -> [FILTERED OUT] Student Sem '{current_sem_str}' not in eligibility.")
            continue
    
    print("  -> Passed Eligibility Filter")

    # Serialize Logic
    try:
        event_dict = event.__dict__.copy()
        
        # Clean SQLAlchemy state
        if '_sa_instance_state' in event_dict:
            del event_dict['_sa_instance_state']
            
        event_dict['eligibility'] = eligibility_list
        event_dict['attachments'] = json.loads(event.attachments) if event.attachments else []
        event_dict['created_by'] = event.created_by
        
        # Manually add missing fields if they are None in DB but required?
        # Pydantic should handle Optionals.
        
        print(f"  -> Serialized Dict. Checking Pydantic Validation...")
        
        # Validate
        try:
            validated = EventRead(**event_dict)
            print("  -> [VALID] Pydantic Accepted.")
            results.append(validated)
        except Exception as ve:
            print(f"  -> [INVALID] Pydantic Failed: {ve}")
            
    except Exception as e:
        print(f"  -> Critical Serialization Error: {e}")

print(f"\n--- FINAL RESULT ---")
print(f"Events compatible with API: {len(results)}")
session.close()
