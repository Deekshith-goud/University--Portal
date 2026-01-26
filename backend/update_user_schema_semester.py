from sqlalchemy import create_engine, text
from app.core.database import DATABASE_URL

def update_schema():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # 1. Add semester column
        print("Adding semester column...")
        try:
            connection.execute(text("ALTER TABLE users ADD COLUMN semester INTEGER NULL"))
            print("Added semester column.")
        except Exception as e:
            print(f"Column might already exist: {e}")

        # 2. Migrate Data
        print("Migrating data (Year -> Semester)...")
        # Logic: semester = (year * 2) - 1. Only for students.
        connection.execute(text("UPDATE users SET semester = (year * 2) - 1 WHERE role = 'student' AND year IS NOT NULL"))
        # Set default semester for students with no year? Defaults to 1.
        connection.execute(text("UPDATE users SET semester = 1 WHERE role = 'student' AND semester IS NULL"))
        
        # Ensure non-students have NULL semester
        connection.execute(text("UPDATE users SET semester = NULL WHERE role != 'student'"))
        
        print("Data migration complete.")

        # 3. Drop year column
        print("Dropping year column...")
        try:
            connection.execute(text("ALTER TABLE users DROP COLUMN year"))
            print("Dropped year column.")
        except Exception as e:
            print(f"Could not drop column (might not exist): {e}")

        connection.commit()
        print("Schema update finished successfully.")

if __name__ == "__main__":
    update_schema()
