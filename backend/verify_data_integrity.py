from app.core.database import SessionLocal
from app.models import Event
import json
from datetime import datetime

db = SessionLocal()
events = db.query(Event).filter(Event.club_id == None).all()

print(f"Checking {len(events)} events for Schema Integrity...")

for e in events:
    error_found = False
    
    # Check JSON fields
    try:
        att = json.loads(e.attachments) if e.attachments else []
        if not isinstance(att, list):
            print(f"[FAIL] Event {e.id}: 'attachments' is not a list. Value: {e.attachments}")
            error_found = True
        else:
            for item in att:
                if not isinstance(item, dict):
                     print(f"[FAIL] Event {e.id}: 'attachments' item is not dict. Item: {item}")
                     error_found = True
    except Exception as err:
        print(f"[FAIL] Event {e.id}: 'attachments' JSON parse error: {err}")
        error_found = True
        
    try:
        elig = json.loads(e.eligibility) if e.eligibility else []
        if not isinstance(elig, list):
             # Eligibility 'None' is fine, but if string it must be list
             print(f"[FAIL] Event {e.id}: 'eligibility' is not a list. Value: {e.eligibility}")
             error_found = True
    except Exception as err:
        print(f"[FAIL] Event {e.id}: 'eligibility' JSON parse error: {err}")
        error_found = True
        
    # Check Required Fields
    if not e.title:
        print(f"[FAIL] Event {e.id}: Missing Title")
        error_found = True
    if not e.date:
        print(f"[FAIL] Event {e.id}: Missing Date")
        error_found = True
        
    if not error_found:
        print(f"[OK] Event {e.id} seems valid.")

db.close()
