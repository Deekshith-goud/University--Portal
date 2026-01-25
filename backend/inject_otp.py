from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models import OTP, User
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import sys

# DATABASE_URL adjustment if needed, assuming default from env or generic
# We need to match what's in .env or app/core/database.py
# Assuming sqlite for local or mysql. 
from app.core.database import engine 

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def inject_otp(email, code):
    session = SessionLocal()
    try:
        # Delete old
        session.query(OTP).filter(OTP.email == email).delete()
        
        otp = OTP(email=email, code=code, expires_at=datetime.utcnow() + timedelta(minutes=10))
        session.add(otp)
        session.commit()
        print(f"Injected OTP {code} for {email}")
    except Exception as e:
        print(f"Error injecting OTP: {e}")
    finally:
        session.close()

def delete_user(email):
    session = SessionLocal()
    try:
        session.query(User).filter(User.email == email).delete()
        session.commit()
        print(f"Deleted user {email}")
    except Exception as e:
        print(f"Error deleting user: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    email = "student_test_verification@example.com"
    delete_user(email)
    inject_otp(email, "123456")
