from app.core.database import SessionLocal, engine
from app.models import Event
from datetime import datetime, timedelta
import random

def fix_events():
    db = SessionLocal()
    try:
        events = db.query(Event).all()
        print(f"Found {len(events)} events. Checking for missing data...")
        
        updated_count = 0
        default_images = [
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000",
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000",
            "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=2000",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2000"
        ]

        for event in events:
            changed = False
            
            # Fix Poster
            if not event.image_poster or event.image_poster.strip() == "":
                event.image_poster = random.choice(default_images)
                changed = True
                
            # Fix Venue
            if not event.venue:
                event.venue = "Main Auditorium"
                changed = True
                
            # Fix Coordinator
            if not event.coordinator_name:
                event.coordinator_name = "Dr. Smith"
                event.coordinator_details = "smith@university.edu"
                changed = True
                
            # Fix Participation Type
            if not event.participation_type:
                event.participation_type = "individual"
                event.min_team_size = 1
                event.max_team_size = 1
                changed = True
                
            # Fix Description (if too short)
            if len(event.description) < 20:
                event.description = f"{event.title} is an exciting event for all students. Join us to learn, complete, and have fun! This is a placeholder description for better UI visualization."
                changed = True

            # Fix Target Depts
            if not event.target_departments:
                event.target_departments = '["CSE", "ECE", "MECH", "CIVIL", "EEE"]' # JSON string
                changed = True
                
            if changed:
                updated_count += 1
                
        db.commit()
        print(f"Successfully updated {updated_count} events with complete details.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_events()
