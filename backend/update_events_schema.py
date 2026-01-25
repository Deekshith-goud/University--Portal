import sys
import os

# Add the parent directory to sys.path to resolve imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
from sqlalchemy import text

def update_schema():
    with engine.connect() as conn:
        print("Checking and updating schema...")
        
        # 1. Create EventRegistration table
        try:
            conn.execute(text("SELECT 1 FROM event_registrations LIMIT 1"))
        except Exception:
            print("Creating event_registrations table...")
            conn.execute(text("""
                CREATE TABLE event_registrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_id INT,
                    student_id INT,
                    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (event_id) REFERENCES events(id),
                    FOREIGN KEY (student_id) REFERENCES users(id)
                )
            """))

        # 2. Add columns to Events
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN location VARCHAR(255)"))
            print("Added 'location' to events.")
        except Exception as e: print("Column 'location' might already exist.")

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN image_banner VARCHAR(500)"))
            print("Added 'image_banner' to events.")
        except Exception: pass

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN requires_registration BOOLEAN DEFAULT FALSE"))
            print("Added 'requires_registration' to events.")
        except Exception: pass
        
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN event_type VARCHAR(100) DEFAULT 'Event'"))
            print("Added 'event_type' to events.")
        except Exception: pass

        # 3. Add columns to Announcements
        try:
            conn.execute(text("ALTER TABLE announcements ADD COLUMN priority VARCHAR(50) DEFAULT 'normal'"))
            print("Added 'priority' to announcements.")
        except Exception: pass

        try:
            conn.execute(text("ALTER TABLE announcements ADD COLUMN link VARCHAR(500)"))
            print("Added 'link' to announcements.")
        except Exception: pass

        conn.commit()
        print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
