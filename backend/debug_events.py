from app.core.database import SessionLocal
from app.models import Event, User
import json

db = SessionLocal()

print("--- USERS ---")
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id}, Name: {u.name}, Role: {u.role}, Email: {u.email}")

print("\n--- EVENTS ---")
events = db.query(Event).all()
for e in events:
    print(f"ID: {e.id}, Title: {e.title}, ClubID: {e.club_id}, Date: {e.date}, Eligibility: {e.eligibility}")
    # Check if correct params for college event
    is_college = e.club_id is None
    print(f"  -> Is College Event? {is_college}")

db.close()
