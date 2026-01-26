from sqlalchemy import text
from app.core.database import engine

def update_schema():
    print("Migrating Auth Schema (Users)...")
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        
        # 1. Add registration_number
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN registration_number VARCHAR(50)"))
            print("Added 'registration_number' column.")
        except Exception as e:
            print(f"Skipping 'registration_number': {e}")

        # 2. Add branch
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN branch VARCHAR(50)"))
            print("Added 'branch' column.")
        except Exception as e:
            print(f"Skipping 'branch': {e}")

        # 3. Add section
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN section VARCHAR(50)"))
            print("Added 'section' column.")
        except Exception as e:
            print(f"Skipping 'section': {e}")
            
        # 4. Add year
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN year INTEGER DEFAULT 1"))
            print("Added 'year' column.")
        except Exception as e:
            print(f"Skipping 'year': {e}")

        # 5. Add created_at
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME"))
            print("Added 'created_at' column.")
        except Exception as e:
            print(f"Skipping 'created_at': {e}")

        # 6. Set Default Year for existing users
        try:
            conn.execute(text("UPDATE users SET year = 1 WHERE year IS NULL"))
            print("Updated existing users to Year 1.")
        except Exception as e:
            print(f"Error updating existing users: {e}")

if __name__ == "__main__":
    update_schema()
