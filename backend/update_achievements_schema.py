from app.core.database import SessionLocal, engine
from sqlalchemy import text

def update_schema():
    print("Updating Achievement Schema...")
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # 1. Modify event_id to be nullable
            conn.execute(text("ALTER TABLE achievements MODIFY COLUMN event_id INTEGER NULL"))
            
            # 2. Add new columns
            try:
                conn.execute(text("ALTER TABLE achievements ADD COLUMN external_event_name VARCHAR(255) NULL"))
            except Exception as e: print("Column external_event_name might exist")
            
            try:
                conn.execute(text("ALTER TABLE achievements ADD COLUMN description TEXT NULL"))
            except Exception as e: print("Column description might exist")

            try:
                conn.execute(text("ALTER TABLE achievements ADD COLUMN category VARCHAR(100) DEFAULT 'Internal'"))
            except Exception as e: print("Column category might exist")
            
            try:
                conn.execute(text("ALTER TABLE achievements ADD COLUMN badge VARCHAR(50) DEFAULT 'Gold'"))
            except Exception as e: print("Column badge might exist")
            
            try:
                conn.execute(text("ALTER TABLE achievements ADD COLUMN image_url VARCHAR(500) NULL"))
            except Exception as e: print("Column image_url might exist")
            
            # 3. Drop 'position' if it exists (mapped to title/badge now mostly, but we can keep it backward compatible or drop. User didn't say drop. I replaced it in model, so I should maybe ignore it or drop it.)
            # I removed it from model, so technically I should drop it to be clean, OR just leave it as ghost column.
            # Safety: Leave it.
            
            trans.commit()
            print("Schema Updated successfully.")
        except Exception as e:
            trans.rollback()
            print(f"Error: {e}")

if __name__ == "__main__":
    update_schema()
