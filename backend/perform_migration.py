from app.core.database import get_session
from sqlalchemy import text
import sys

def migrate():
    print("Starting Migration...")
    db = next(get_session())
    
    # List of columns to check/add
    # Note: SQLite ALGORITHM=INSTANT not supported, but we can just run ALTER TABLE
    # If using MySQL (pymysql error suggested it), we can run these.
    # The error was: (pymysql.err.OperationalError)
    # So it IS MySQL or similar. ALTER TABLE ADD COLUMN IF NOT EXISTS is valid in recent versions,
    # or just ADD COLUMN.
    
    commands = [
        "ALTER TABLE events ADD COLUMN target_departments TEXT NULL",
        "ALTER TABLE events ADD COLUMN coordinator_name VARCHAR(100) NULL",
        "ALTER TABLE events ADD COLUMN coordinator_details TEXT NULL",
        "ALTER TABLE events ADD COLUMN image_poster VARCHAR(500) NULL",
        "ALTER TABLE events ADD COLUMN participation_type VARCHAR(50) DEFAULT 'individual'",
        "ALTER TABLE events ADD COLUMN min_team_size INT DEFAULT 1",
        "ALTER TABLE events ADD COLUMN max_team_size INT DEFAULT 1",
        "ALTER TABLE events ADD COLUMN attachments TEXT NULL",
        "ALTER TABLE events ADD COLUMN eligibility TEXT NULL",
        "ALTER TABLE events ADD COLUMN contact_phone VARCHAR(50) NULL",
        "ALTER TABLE events ADD COLUMN contact_email VARCHAR(255) NULL",
        "ALTER TABLE events ADD COLUMN venue VARCHAR(255) NULL",
        "ALTER TABLE events ADD COLUMN is_open BOOLEAN DEFAULT TRUE",
        "ALTER TABLE events ADD COLUMN registration_deadline DATETIME NULL",
        "ALTER TABLE events ADD COLUMN event_type VARCHAR(100) DEFAULT 'Event'"
    ]
    
    # We try each one. If column exists, it might fail. Only specific DBs support IF NOT EXISTS in ALTER.
    # We can inspect information_schema or just try/except.
    
    for cmd in commands:
        try:
            print(f"Executing: {cmd}")
            db.execute(text(cmd))
            db.commit()
            print("Done.")
        except Exception as e:
            # If "Duplicate column name", ignore.
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print(f"Column already exists, skipping.")
                db.rollback()
            else:
                print(f"Error executing {cmd}: {e}")
                db.rollback()
                # Continue best effort?
    
    print("Migration attempt finished.")

if __name__ == "__main__":
    migrate()
