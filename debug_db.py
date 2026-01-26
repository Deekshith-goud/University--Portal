import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.core.database import SessionLocal
from app.models import User, Assignment, Submission

db = SessionLocal()

target_email = "student@university.du"
user = db.query(User).filter(User.email == target_email).first()

if not user:
    print(f"User with email {target_email} not found!")
else:
    print(f"User Found: ID={user.id}, Name={user.name}, Role={user.role}")
    
    print("-" * 50)
    print(f"SUBMISSIONS for User ID {user.id}")
    submissions = db.query(Submission).filter(Submission.student_id == user.id).all()
    for s in submissions:
        print(f"Submission ID: {s.id} | Assignment ID: {s.assignment_id} | File: {s.file_url} | Time: {s.submitted_at}")

    print("-" * 50)
    print("ASSIGNMENTS")
    assignments = db.query(Assignment).all()
    for a in assignments:
        is_submitted = any(s.assignment_id == a.id for s in submissions)
        print(f"Assignment ID: {a.id} | Title: {a.title} | Submitted: {is_submitted}")

db.close()
