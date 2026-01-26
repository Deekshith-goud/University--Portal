
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.core.database import SessionLocal
from app.models import Submission, User
from app.schemas.assignments import SubmissionRead

db = SessionLocal()
try:
    # Get a real submission
    user = db.query(User).filter(User.email == "student@university.du").first()
    submissions = db.query(Submission).filter(Submission.student_id == user.id).all()
    
    print(f"Found {len(submissions)} submissions.")
    for s in submissions:
        print(f"Validating submission {s.id}...")
        try:
            read_model = SubmissionRead.model_validate(s)
            print("OK.")
        except Exception as e:
            print(f"FAILED: {e}")
            import traceback
            traceback.print_exc()

finally:
    db.close()
