from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.core.database import get_session
from app.models import Note, User
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/notes", tags=["notes"])

# Verify uploads directory exists
UPLOAD_DIR = "uploads/notes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class UploaderInfo(BaseModel):
    name: str
    role: str
    
    class Config:
        from_attributes = True

class NoteRead(BaseModel):
    id: int
    title: str
    subject: str
    file_url: str
    uploaded_by_id: int
    uploaded_by: UploaderInfo | None = None
    branch: str | None = None
    tag: str | None = None
    year: int | None = None
    
    class Config:
        from_attributes = True

@router.post("/upload", response_model=NoteRead)
def upload_note(
    title: str = Form(None), 
    subject: str = Form(...),
    branch: str = Form(None),
    tag: str = Form(None),
    section: str = Form(None),
    year: int = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Validate File
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type. Only PDF/JPG/PNG allowed.")
        
    # 2. Save File
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 3. Create DB Entry
    db_file_url = f"/static/notes/{unique_filename}"
    
    db_note = Note(
        title=title or f"{subject} - {tag}",
        subject=subject,
        branch=branch,
        tag=tag,
        section=section,
        year=year,
        file_url=db_file_url,
        uploaded_by_id=current_user.id
    )
    session.add(db_note)
    session.commit()
    session.refresh(db_note)
    # Manually populate relationship for response to avoid refresh query or if lazy load behaves oddly in some setups
    db_note.uploaded_by = current_user 
    return db_note

@router.get("/", response_model=List[NoteRead])
def read_notes(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Use distinct to avoid duplicates if joins behave unexpectedly, though joinedload shouldn't cause them here.
    query = select(Note).options(joinedload(Note.uploaded_by)).order_by(Note.uploaded_at.desc())
    
    if current_user.role == "student":
         # Filter: semester matches or is null (shared)
         query = query.filter((Note.year == None) | (Note.year == current_user.year))
         
    notes = session.execute(query).scalars().unique().all()
    return notes

@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    note = session.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    # Check ownership or admin role (assuming 'admin' role exists, checking strict ownership for now)
    if note.uploaded_by_id != current_user.id and current_user.role != 'admin':
         raise HTTPException(status_code=403, detail="Not authorized to delete this note")

    # Delete file from disk
    # file_url is like "/static/notes/uuid..."
    try:
        filename = note.file_url.split("/")[-1]
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")

    session.delete(note)
    session.commit()
    return {"message": "Note deleted successfully"}
