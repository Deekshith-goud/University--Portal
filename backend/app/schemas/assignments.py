from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class AssignmentBase(BaseModel):
    title: str
    description: str
    deadline: datetime

class AssignmentCreate(AssignmentBase):
    pass

class FacultyInfo(BaseModel):
    name: str
    
    class Config:
        from_attributes = True

class AssignmentRead(AssignmentBase):
    id: int
    faculty_id: int
    faculty: Optional[FacultyInfo] = None
    attachment_url: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None

    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    file_url: str

class SubmissionRead(BaseModel):
    id: int
    assignment_id: Optional[int] = None
    student_id: int
    file_url: str
    submitted_at: datetime
    student_name: Optional[str] = None
    registration_number: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    
    class Config:
        from_attributes = True
