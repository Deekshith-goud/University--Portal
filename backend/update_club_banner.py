from app.core.database import engine, Base
from sqlalchemy import text

def run_migration():
    with engine.connect() as connection:
        # Check if column exists
        result = connection.execute(text("SHOW COLUMNS FROM clubs LIKE 'banner_image'"))
        if not result.fetchone():
            print("Adding 'banner_image' column to 'clubs' table...")
            try:
                connection.execute(text("ALTER TABLE clubs ADD COLUMN banner_image VARCHAR(500)"))
                print("Migration successful: Added 'banner_image' column.")
            except Exception as e:
                print(f"Migration failed: {e}")
        else:
            print("Column 'banner_image' already exists.")

if __name__ == "__main__":
    run_migration()
