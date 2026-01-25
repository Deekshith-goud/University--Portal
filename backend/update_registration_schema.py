import sys
import os

# Add the parent directory to sys.path to resolve imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
from sqlalchemy import text

def update_schema():
    with engine.connect() as conn:
        print("Updating schema for Enhanced Registration...")
        
        # 1. Update Users table
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN registration_number VARCHAR(50)"))
            print("Added 'registration_number' to users.")
        except Exception: pass
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN branch VARCHAR(50)"))
            print("Added 'branch' to users.")
        except Exception: pass
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN section VARCHAR(50)"))
            print("Added 'section' to users.")
        except Exception: pass

        # 2. Update Events table
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN participation_type VARCHAR(50) DEFAULT 'individual'"))
            print("Added 'participation_type' to events.")
        except Exception: pass

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN min_team_size INT DEFAULT 1"))
            print("Added 'min_team_size' to events.")
        except Exception: pass

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN max_team_size INT DEFAULT 1"))
            print("Added 'max_team_size' to events.")
        except Exception: pass

        # 3. Update EventRegistrations table
        try:
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN team_name VARCHAR(100)"))
            print("Added 'team_name' to event_registrations.")
        except Exception: pass

        try:
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN team_size INT DEFAULT 1"))
            print("Added 'team_size' to event_registrations.")
        except Exception: pass

        try:
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN member_details TEXT"))
            print("Added 'member_details' to event_registrations.")
        except Exception: pass

        conn.commit()
        print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
