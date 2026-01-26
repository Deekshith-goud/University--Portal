from sqlalchemy import create_engine, text
from app.core.database import DATABASE_URL
import json
import math

def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        print("Starting migration: Semester -> Year")

        # --- 1. USERS TABLE ---
        print("Migrating 'users' table...")
        try:
            connection.execute(text("ALTER TABLE users ADD COLUMN year INTEGER NULL"))
            print("Added 'year' column to users.")
        except Exception as e:
            print(f"info: 'year' column in users might exist: {e}")

        # Data Migration: Year = (Semester + 1) // 2
        # Using MySQL syntax: (semester + 1) DIV 2
        connection.execute(text("UPDATE users SET year = (semester + 1) DIV 2 WHERE role = 'student' AND semester IS NOT NULL"))
        connection.execute(text("UPDATE users SET year = 1 WHERE role = 'student' AND year IS NULL")) # Default
        
        # Drop semester
        try:
            connection.execute(text("ALTER TABLE users DROP COLUMN semester"))
            print("Dropped 'semester' column from users.")
        except Exception as e:
            print(f"info: could not drop semester: {e}")


        # --- 2. NOTES TABLE ---
        print("Migrating 'notes' table...")
        try:
            connection.execute(text("ALTER TABLE notes ADD COLUMN year INTEGER NULL"))
            print("Added 'year' column to notes.")
        except:
            pass

        connection.execute(text("UPDATE notes SET year = (semester + 1) DIV 2 WHERE semester IS NOT NULL"))

        try:
            connection.execute(text("ALTER TABLE notes DROP COLUMN semester"))
            print("Dropped 'semester' column from notes.")
        except:
            pass


        # --- 3. ANNOUNCEMENTS TABLE ---
        print("Migrating 'announcements' table...")
        # Add target_years
        try:
            connection.execute(text("ALTER TABLE announcements ADD COLUMN target_years TEXT NULL"))
            print("Added 'target_years' column.")
        except:
            pass
            
        # We need to process JSON data python-side for this one
        result = connection.execute(text("SELECT id, target_semesters FROM announcements WHERE target_semesters IS NOT NULL"))
        rows = result.fetchall()
        
        for row in rows:
            ann_id = row[0]
            raw_json = row[1]
            try:
                sems = json.loads(raw_json)
                if isinstance(sems, list):
                    # Convert semesters to years
                    years = set()
                    for s in sems:
                        try:
                            s_int = int(s)
                            y = math.ceil(s_int / 2)
                            years.add(str(y))
                        except:
                            pass
                    
                    new_json = json.dumps(list(years))
                    connection.execute(text("UPDATE announcements SET target_years = :y WHERE id = :id"), {"y": new_json, "id": ann_id})
            except Exception as e:
                print(f"Skipping announcement {ann_id}: {e}")

        try:
            connection.execute(text("ALTER TABLE announcements DROP COLUMN target_semesters"))
            print("Dropped 'target_semesters' column.")
        except:
            pass


        connection.commit()
        print("Migration complete successfully.")

if __name__ == "__main__":
    migrate()
