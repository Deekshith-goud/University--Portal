from app.core.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

def create_users():
    db = SessionLocal()
    try:
        # 1. Create Student
        student_email = "student@university.edu"
        if not db.query(User).filter(User.email == student_email).first():
            student = User(
                name="John Student",
                email=student_email,
                password_hash=get_password_hash("student123"),
                role="student",
                is_active=True
            )
            db.add(student)
            print(f"[OK] Created Student: {student_email} / student123")

        # 2. Create Faculty
        faculty_email = "faculty@university.edu"
        if not db.query(User).filter(User.email == faculty_email).first():
            faculty = User(
                name="Dr. Smith",
                email=faculty_email,
                password_hash=get_password_hash("faculty123"),
                role="faculty",
                is_active=True
            )
            db.add(faculty)
            print(f"[OK] Created Faculty: {faculty_email} / faculty123")
            
        db.commit()
    except Exception as e:
        print(f"[X] Error creating users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
