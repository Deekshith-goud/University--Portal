from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
import json

# DB Config
DB_USER = "root"
DB_PASSWORD = "Deekshith@mysql"
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "student_portal_db"

encoded_password = quote_plus(DB_PASSWORD)
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def update_schema():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Checking and updating schema for College Events & Announcements...")
        
        # 1. Update EVENTS table
        # Columns: registration_deadline, is_open, eligibility, venue, contact_phone, contact_email, image_poster, attachments
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN registration_deadline DATETIME NULL"))
            print("Added registration_deadline to events")
        except Exception as e:
            print(f"Skipped registration_deadline: {e}")

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN is_open BOOLEAN DEFAULT 1"))
            print("Added is_open to events")
        except Exception as e:
            print(f"Skipped is_open: {e}")
            
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN eligibility TEXT NULL")) # JSON of allowed branches/years
            print("Added eligibility to events")
        except Exception as e:
            print(f"Skipped eligibility: {e}")

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN venue VARCHAR(255) NULL"))
            print("Added venue to events")
        except Exception as e:
            print(f"Skipped venue: {e}")

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN contact_phone VARCHAR(50) NULL"))
            print("Added contact_phone to events")
        except Exception as e:
            print(f"Skipped contact_phone: {e}")

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN contact_email VARCHAR(255) NULL"))
            print("Added contact_email to events")
        except Exception as e:
            print(f"Skipped contact_email: {e}")

        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN image_poster VARCHAR(500) NULL"))
            print("Added image_poster to events")
        except Exception as e:
            print(f"Skipped image_poster: {e}")
            
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN attachments TEXT NULL")) # JSON
            print("Added attachments to events")
        except Exception as e:
            print(f"Skipped attachments: {e}")

        # 2. Update ANNOUNCEMENTS table
        # Columns: category, is_pinned, target_departments, images
        try:
            conn.execute(text("ALTER TABLE announcements ADD COLUMN category VARCHAR(100) DEFAULT 'Notice'"))
            print("Added category to announcements")
        except Exception as e:
            print(f"Skipped category: {e}")

        try:
            conn.execute(text("ALTER TABLE announcements ADD COLUMN is_pinned BOOLEAN DEFAULT 0"))
            print("Added is_pinned to announcements")
        except Exception as e:
            print(f"Skipped is_pinned: {e}")

        try:
            conn.execute(text("ALTER TABLE announcements ADD COLUMN target_departments TEXT NULL")) # JSON
            print("Added target_departments to announcements")
        except Exception as e:
            print(f"Skipped target_departments: {e}")

        try:
            conn.execute(text("ALTER TABLE announcements ADD COLUMN images TEXT NULL")) # JSON of image URLs
            print("Added images to announcements")
        except Exception as e:
            print(f"Skipped images: {e}")

        # 3. Update EVENT_REGISTRATIONS table
        # Columns: student_phone, student_email, id_proof_url, payment_screenshot_url, team_details(update)
        try:
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN student_phone VARCHAR(50) NULL"))
            print("Added student_phone to event_registrations")
        except Exception as e:
            print(f"Skipped student_phone: {e}")

        try:
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN student_email VARCHAR(255) NULL"))
            print("Added student_email to event_registrations")
        except Exception as e:
            print(f"Skipped student_email: {e}")

        try:
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN id_proof_url VARCHAR(500) NULL"))
            print("Added id_proof_url to event_registrations")
        except Exception as e:
            print(f"Skipped id_proof_url: {e}")

        try:
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN payment_screenshot_url VARCHAR(500) NULL"))
            print("Added payment_screenshot_url to event_registrations")
        except Exception as e:
            print(f"Skipped payment_screenshot_url: {e}")
            
        conn.commit()
        print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
