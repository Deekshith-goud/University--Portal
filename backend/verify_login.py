from app.core.database import SessionLocal
from app.models import User
from app.core.security import verify_password, get_password_hash

def test_login():
    db = SessionLocal()
    try:
        email = "admin@university.edu"
        password = "admin123"
        
        print(f"Testing login for: {email}")
        
        # 1. Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print("[X] User NOT FOUND in database.")
            return

        print(f"[OK] User found: {user.email} (Role: {user.role})")
        print(f"   Stored Hash: {user.password_hash}")

        # 2. Check password verification
        is_valid = verify_password(password, user.password_hash)
        if is_valid:
            print("[OK] Password verification SUCCESS.")
        else:
            print("[X] Password verification FAILED.")
            
            # Debug: generate a new hash to see what it looks like
            new_hash = get_password_hash(password)
            print(f"   Expected Hash format example (newly generated): {new_hash}")
            
    except Exception as e:
        print(f"[X] Error during test: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_login()
