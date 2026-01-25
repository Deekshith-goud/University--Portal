from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# Announcement
class AnnouncementBase(BaseModel):
    title: str
    content: str
    attachments: Optional[List[Dict[str, str]]] = [] # List of {name, url}
    priority: Optional[str] = "normal"
    category: Optional[str] = "Notice" # Circular, Notice, Exam, etc.
    is_pinned: bool = False
    target_departments: Optional[List[str]] = None # List of depts or None for all
    images: Optional[List[str]] = [] # List of image URLs

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementRead(AnnouncementBase):
    id: int
    published_at: datetime
    created_by: int
    
    class Config:
        from_attributes = True

# Event
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
    
    # New Fields for College Events
    registration_deadline: Optional[datetime] = None
    is_open: bool = True
    eligibility: Optional[List[str]] = None # List of allowed departments
    venue: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    coordinator_name: Optional[str] = None
    image_poster: Optional[str] = None
    attachments: Optional[List[Dict[str, str]]] = []

class EventCreate(EventBase):
    pass

class EventRead(EventBase):
    id: int
    created_by: Optional[int] = None
    registration_count: int = 0
    is_registered: bool = False
    
    class Config:
        from_attributes = True

class EventRegistrationCreate(BaseModel):
    team_name: Optional[str] = None
    team_size: Optional[int] = 1
    member_details: Optional[str] = None # JSON string
    
    # New Fields
    student_phone: Optional[str] = None
    student_email: Optional[str] = None
    id_proof_url: Optional[str] = None
    payment_screenshot_url: Optional[str] = None

class EventRegistrationRead(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_email: str
    registration_number: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    registered_at: datetime
    team_name: Optional[str] = None
    team_size: int = 1
    member_details: Optional[str] = None
    
    student_phone: Optional[str] = None
    student_email: Optional[str] = None
    id_proof_url: Optional[str] = None
    payment_screenshot_url: Optional[str] = None

    class Config:
        from_attributes = True
