from app.core.database import engine
from sqlalchemy import text

def add_column():
    print("Attempting to add student_name column to event_registrations...")
    with engine.connect() as conn:
        try:
            # Check if column exists is hard in raw sql agnostic way, but for sqlite/postgres we can try adding
            # SQLite: ALTER TABLE table_name ADD COLUMN column_name column_definition;
            conn.execute(text("ALTER TABLE event_registrations ADD COLUMN student_name VARCHAR(255)"))
            conn.commit()
            print("Successfully added 'student_name' column.")
        except Exception as e:
            print(f"Error (maybe already exists?): {e}")

if __name__ == "__main__":
    add_column()
