from sqlalchemy.orm import Session
from app.core.database import engine, Base, SessionLocal
from app.models import User
from app.core.security import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@university.edu").first()
        if not admin:
            print("Creating super admin user...")
            admin_user = User(
                name="System Administrator",
                email="admin@university.edu",
                password_hash=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin created: admin@university.edu / admin123")
        else:
            print("Admin already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
