from app.core.database import engine
from sqlalchemy import inspect, text

def check_schema():
    insp = inspect(engine)
    if float(insp.dialect.server_version_info[0]) < 8:
         # Fallback for some drivers
         pass
         
    columns = insp.get_columns("otps")
    print("Columns in 'otps' table:")
    for c in columns:
        print(f" - {c['name']} ({c['type']})")

    # Optional: Verify if it matches model
    has_otp = any(c['name'] == 'otp' for c in columns)
    has_code = any(c['name'] == 'code' for c in columns)
    
    if has_code and not has_otp:
        print("\nMISMATCH DETECTED: Table has 'code' but Model expects 'otp'.")
        print("Suggested Fix: Drop 'otps' table and restart backend.")
        
        # Auto-fix?
        with engine.connect() as conn:
            print("Dropping table 'otps'...")
            conn.execute(text("DROP TABLE otps"))
            conn.commit()
            print("Table dropped. Restart backend to recreate it.")

if __name__ == "__main__":
    check_schema()
