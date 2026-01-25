from app.core.database import SessionLocal
from app.models import Event, EventRegistration
from sqlalchemy import func
import json

def test_read_events():
    session = SessionLocal()
    try:
        events = session.query(Event).filter(Event.club_id == None).order_by(Event.date).all()
        print(f"Found {len(events)} events.")
        
        results = []
        for event in events:
            print(f"Processing Event ID: {event.id}")
            
            # Simulate API Logic
            reg_count = session.query(func.count(EventRegistration.id)).filter(EventRegistration.event_id == event.id).scalar()
            
            event_dict = event.__dict__.copy()
            event_dict['registration_count'] = reg_count or 0
            event_dict['is_registered'] = False # Mock
            
            # JSON Parsing
            try:
                print(f"  Raw Eligibility: {event.eligibility}")
                event_dict['eligibility'] = json.loads(event.eligibility) if event.eligibility else None
            except Exception as e:
                print(f"  ERROR parsing eligibility for ID {event.id}: {e}")

            try:
                print(f"  Raw Attachments: {event.attachments}")
                event_dict['attachments'] = json.loads(event.attachments) if event.attachments else []
                print(f"  Parsed Attachments: {event_dict['attachments']}")
            except Exception as e:
                print(f"  ERROR parsing attachments for ID {event.id}: {e}")

            results.append(event_dict)
            print("  -> Success")
            
        print("All events processed successfully.")
        
    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    test_read_events()
