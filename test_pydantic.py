
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "backend"))
from datetime import datetime

from app.models import Submission
from app.schemas.assignments import SubmissionRead

try:
    s = Submission(
        id=1,
        assignment_id=1,
        student_id=1,
        file_url="http://test",
        submitted_at=datetime.now(),
        registration_number="123",
        branch="CSE",
        section="A"
    )
    
    # Try validation
    print("Attempting validation...")
    read_model = SubmissionRead.model_validate(s)
    print("Validation successful!")
    print(read_model)

except Exception as e:
    print(f"Validation FAILED: {e}")
