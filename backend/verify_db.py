from sqlalchemy import text
from app.core.database import engine, Base, SessionLocal

def verify_setup():
    print("Step 1: Connecting to Database...")
    try:
        connection = engine.connect()
        print("[OK] Connection Successful!")
    except Exception as e:
        print(f"[ERROR] Connection Failed: {e}")
        return

    print("\nStep 2: Creating Tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Tables Created (or already exist).")
    except Exception as e:
        print(f"[ERROR] Table Creation Failed: {e}")
        return

    print("\nStep 3: Testing Simple Query...")
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1"))
        print(f"[OK] Query Successful! Result: {result.fetchone()}")
    except Exception as e:
        print(f"[ERROR] Query Failed: {e}")
    finally:
        db.close()
        connection.close()

if __name__ == "__main__":
    verify_setup()
