from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AchievementBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Internal" # Internal, External, Academic
    badge: str = "Gold" 
    image_url: Optional[str] = None
    certificate_url: Optional[str] = None
    external_event_name: Optional[str] = None

class AchievementCreate(AchievementBase):
    event_id: Optional[int] = None # Now Optional
    user_id: Optional[int] = None # Optional, can use reg number
    registration_number: Optional[str] = None # Alternative to user_id

class AchievementOut(AchievementBase):
    id: int
    event_id: Optional[int]
    user_id: int
    created_at: datetime
    
    # Enriched Data
    student_name: Optional[str] = None
    student_details: Optional[dict] = None # {branch, year, section, reg_no}
    event_title: Optional[str] = None

    class Config:
        from_attributes = True
