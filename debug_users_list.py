
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.core.database import SessionLocal
from app.models import User

db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id} | Email: {u.email} | Role: {u.role}")
db.close()
