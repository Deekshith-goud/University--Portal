from app.core.database import SessionLocal
from app.models import User
from app.core.security import verify_password

def debug_users():
    db = SessionLocal()
    print("--- DEBUGGING USERS ---")
    try:
        users = db.query(User).all()
        if not users:
            print("[X] NO USERS FOUND IN DB.")
            return

        for user in users:
            print(f"\nUser: {user.email} (Role: {user.role}, ID: {user.id})")
            print(f"   Is Active: {user.is_active}")
            
            # Test specific passwords based on role/email
            test_pass = None
            if "admin" in user.email:
                test_pass = "admin123"
            elif "student" in user.email:
                test_pass = "student123"
            elif "faculty" in user.email:
                test_pass = "faculty123"
            
            if test_pass:
                is_valid = verify_password(test_pass, user.password_hash)
                if is_valid:
                    print(f"   [OK] Password '{test_pass}' is CORRECT.")
                else:
                    print(f"   [X] Password '{test_pass}' is WRONG.")
                    print(f"   Stored Hash: {user.password_hash[:20]}...")
            else:
                print("   (No standard password to test)")

    except Exception as e:
        print(f"[X] Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_users()
