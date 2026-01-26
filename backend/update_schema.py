from sqlalchemy import text
from app.core.database import engine

def update_schema():
    print("Migrating Database Schema...")
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        try:
            # 1. Add branch
            try:
                conn.execute(text("ALTER TABLE notes ADD COLUMN branch VARCHAR(50)"))
                print("Added 'branch' column.")
            except Exception as e:
                print(f"Skipping 'branch' (might exist): {e}")

            # 2. Add tag
            try:
                conn.execute(text("ALTER TABLE notes ADD COLUMN tag VARCHAR(100)"))
                print("Added 'tag' column.")
            except Exception as e:
                print(f"Skipping 'tag' (might exist): {e}")

            # 3. Add section
            try:
                conn.execute(text("ALTER TABLE notes ADD COLUMN section VARCHAR(50)"))
                print("Added 'section' column.")
            except Exception as e:
                print(f"Skipping 'section' (might exist): {e}")

        except Exception as e:
            print(f"Migration Error: {e}")

if __name__ == "__main__":
    update_schema()
