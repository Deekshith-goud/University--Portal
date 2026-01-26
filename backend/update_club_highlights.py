from app.core.database import engine, Base
from sqlalchemy import text

def run_migration():
    with engine.connect() as connection:
        # Check if column exists
        result = connection.execute(text("SHOW COLUMNS FROM clubs LIKE 'highlights'"))
        if not result.fetchone():
            print("Adding 'highlights' column to 'clubs' table...")
            try:
                connection.execute(text("ALTER TABLE clubs ADD COLUMN highlights TEXT"))
                print("Migration successful: Added 'highlights' column.")
            except Exception as e:
                print(f"Migration failed: {e}")
        else:
            print("Column 'highlights' already exists.")

if __name__ == "__main__":
    run_migration()
