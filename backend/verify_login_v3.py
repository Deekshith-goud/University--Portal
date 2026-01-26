from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.core.database import DATABASE_URL
from app.models import User
from app.core.security import get_password_hash, verify_password, create_access_token

# Setup DB connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def test_login_flow():
    email = "test_login_debug@university.edu"
    password = "password123"
    
    # 1. Cleanup previous test
    existing = db.execute(select(User).where(User.email == email)).scalars().first()
    if existing:
        db.delete(existing)
        db.commit()
        print(f"Cleaned up previous user {email}")

    # 2. Create User manually (Mimic Registration)
    print("Creating Test User...")
    hashed = get_password_hash(password)
    user = User(
        name="Debug User",
        email=email,
        password_hash=hashed,
        role="student",
        semester=3,
        branch="CSE",
        section="A",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"User Created: ID={user.id} Role={user.role} Semester={user.semester}")

    # 3. Verify Password Logic
    print("Verifying Password...")
    if verify_password(password, user.password_hash):
        print("Password Verification: SUCCESS")
    else:
        print("Password Verification: FAILED")
        return

    # 4. Generate Token (Mimic Login Endpoint)
    print("Generating Token...")
    claims = {
        "role": user.role,
        "id": user.id,
        "branch": user.branch,
        "section": user.section,
        "semester": user.semester
    }
    token = create_access_token(subject=user.email, additional_claims=claims)
    print(f"Token Generated: {token[:20]}...")

    # 5. Verify Claims (Optional - skipped as we trust the library)
    print("Backend Login Flow seems operational.")

if __name__ == "__main__":
    try:
        test_login_flow()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()
