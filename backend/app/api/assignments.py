from typing import List, Optional
import shutil
import os
import uuid
from pathlib import Path
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, or_
from app.core.database import get_session
from app.models import Assignment, Submission, User
from app.schemas.assignments import AssignmentCreate, AssignmentRead, SubmissionRead
from app.api.deps import require_faculty, require_student, get_current_active_user

router = APIRouter(prefix="/assignments", tags=["assignments"])

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads/assignments")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/", response_model=AssignmentRead)
def create_assignment(
    title: str = Form(...),
    description: str = Form(...),
    deadline: str = Form(...), # expecting ISO format string
    branch: Optional[str] = Form(None),
    section: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_faculty)
):
    # Handle File Upload
    db_file_url = None
    if file:
        file_ext = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        db_file_url = f"/static/assignments/{unique_filename}"

    # Parse Deadline
    try:
        # Accepting generic ISO string (e.g. from js new Date().toISOString())
        # Or simple datetime-local string
        dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
    except ValueError:
        # Fallback for simple date string if strictly needed, or let it fail
        dt = datetime.now() 

    db_assignment = Assignment(
        title=title,
        description=description,
        deadline=dt,
        branch=branch,
        section=section,
        attachment_url=db_file_url,
        faculty_id=current_user.id
    )
    session.add(db_assignment)
    session.commit()
    session.refresh(db_assignment)
    db_assignment.faculty = current_user
    return db_assignment

@router.get("/", response_model=List[AssignmentRead])
def read_assignments(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Assignment).options(joinedload(Assignment.faculty)).order_by(Assignment.deadline.asc())
    assignments = session.execute(query).scalars().all()
    return assignments

@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_faculty)
):
    assignment = session.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this assignment")
    
    session.query(Submission).filter(Submission.assignment_id == assignment_id).delete()
    session.delete(assignment)
    session.commit()
    return {"message": "Assignment deleted successfully"}

@router.get("/me/submissions", response_model=List[SubmissionRead])
def get_my_submissions(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_student)
):
    submissions = session.query(Submission).filter(Submission.student_id == current_user.id).all()
    return submissions

@router.post("/{assignment_id}/submit", response_model=SubmissionRead)
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    reg_no: str = Form(...),
    branch: str = Form(...),
    section: str = Form(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_student)
):
    assignment = session.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Enforce Deadline
    if assignment.deadline:
        now = datetime.now(timezone.utc)
        deadline_aware = assignment.deadline
        if deadline_aware.tzinfo is None:
            deadline_aware = deadline_aware.replace(tzinfo=timezone.utc)
            
        if now > deadline_aware:
            raise HTTPException(status_code=400, detail="Deadline has passed. Late submissions are not accepted.")
        
    # Create directory structure: uploads/faculty_{id}/assignment_{id}/
    faculty_id = assignment.faculty_id
    assignment_dir = UPLOAD_DIR / f"faculty_{faculty_id}" / f"assignment_{assignment_id}"
    assignment_dir.mkdir(parents=True, exist_ok=True)
    
    # Filename format: {reg_no}_{filename} (Using Reg No as primary identifier now)
    safe_filename = file.filename.replace(" ", "_")
    file_path = assignment_dir / f"{reg_no}_{safe_filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    relative_path = str(file_path).replace("\\", "/")
    if relative_path.startswith("uploads/"):
         static_url = relative_path.replace("uploads/", "/static/")
    else:
         static_url = "/static/" + relative_path
         
    db_submission = Submission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        file_url=static_url,
        registration_number=reg_no,
        branch=branch,
        section=section
    )
    session.add(db_submission)
    session.commit()
    session.refresh(db_submission)
    return db_submission

@router.get("/{assignment_id}/submissions", response_model=List[SubmissionRead])
def read_submissions(
    assignment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_faculty)
):
    # Verify assignment belongs to this faculty
    assignment = session.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
         raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.faculty_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to view these submissions")

    # Join Submission with User to get student names
    # Order by Registration Number
    results = session.query(Submission, User.name)\
        .join(User, Submission.student_id == User.id)\
        .filter(Submission.assignment_id == assignment_id)\
        .order_by(Submission.registration_number.asc())\
        .all()
    
    response = []
    for submission, student_name in results:
        sub_dict = submission.__dict__
        sub_dict['student_name'] = student_name
        response.append(sub_dict)
        
    return response
