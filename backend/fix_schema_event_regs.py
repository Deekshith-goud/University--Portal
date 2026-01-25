from app.core.database import engine
from sqlalchemy import text

def fix_schema():
    print("Beginning Schema Update for 'event_registrations'...")
    with engine.connect() as conn:
        # List of columns to potentially add
        columns = [
            ("registration_number", "VARCHAR(50)"),
            ("branch", "VARCHAR(50)"),
            ("section", "VARCHAR(50)"),
            ("student_phone", "VARCHAR(20)"),
            ("student_email", "VARCHAR(255)"),
            ("id_proof_url", "VARCHAR(500)"),
            ("payment_screenshot_url", "VARCHAR(500)")
        ]
        
        for col_name, col_type in columns:
            try:
                # MySQL syntax
                sql = text(f"ALTER TABLE event_registrations ADD COLUMN {col_name} {col_type} NULL;")
                conn.execute(sql)
                print(f"[SUCCESS] Added column '{col_name}'")
            except Exception as e:
                # 1060 is Duplicate column name in MySQL
                if "1060" in str(e) or "Duplicate column" in str(e):
                    print(f"[INFO] Column '{col_name}' already exists.")
                else:
                    print(f"[ERROR] Could not add '{col_name}': {e}")
        
        conn.commit()
    print("Schema Update Complete.")

if __name__ == "__main__":
    fix_schema()
