from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_session
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import User, OTP
from app.schemas.auth import Token, UserCreate, UserOut, OTPRequest, PasswordReset
from app.api.deps import get_current_user
from app.core.email_utils import generate_otp, print_otp_to_console, send_email_otp

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # Strip whitespace and normalize case
    email_clean = form_data.username.strip().lower()

    user = session.execute(select(User).where(User.email == email_clean)).scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Add extra claims to token
    claims = {
        "role": user.role,
        "id": user.id,
        "branch": user.branch,
        "section": user.section,
        "section": user.section,
        "semester": user.semester
    }
    
    access_token = create_access_token(subject=user.email, additional_claims=claims)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/send-otp")
def send_otp(request: OTPRequest, session: Session = Depends(get_session)):
    """
    Generates a 6-digit OTP, stores it in DB, and sends email Synchronously.
    Waits for SMTP confirmation before returning success.
    """
    # 1. Check if user already exists (For registration flow we might allow it? 
    # Usually we check duplicates at end, or warn here. 
    # For now, we allow sending OTP to anyone to verify email ownership).
    
    # 2. Generate OTP
    code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # 3. Store in DB (Invalidate old OTPs for this email?)
    # Optional: Delete old OTPs
    session.query(OTP).filter(OTP.email == request.email).delete()
    
    otp_entry = OTP(email=request.email, code=code, expires_at=expires_at)
    session.add(otp_entry)
    session.commit()
    
    # 4. Send Email Synchronously - STRICT CHECK
    # This will BLOCK until email is sent or fails.
    success = send_email_otp(request.email, code, request.reason)
    
    if not success:
        # Rollback: Delete the OTP since we couldn't send it
        session.delete(otp_entry)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to send email. Please check the address or try again."
        )
    
    return {"message": "OTP sent successfully."}

def verify_otp_logic(session: Session, email: str, code: str):
    """
    Helper to verify OTP. Raises HTTPException if invalid.
    """
    otp_entry = session.execute(
        select(OTP).where(OTP.email == email).order_by(OTP.created_at.desc())
    ).scalars().first()
    
    if not otp_entry:
        raise HTTPException(status_code=400, detail="No OTP found for this email.")
        
    if otp_entry.code != code:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
        
    if otp_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
        
    if otp_entry.is_used:
         raise HTTPException(status_code=400, detail="OTP already used.")
         
    # Mark as used
    otp_entry.is_used = True
    session.add(otp_entry)
    session.commit()
    return True

@router.post("/register", response_model=UserOut)
def register_user(user_in: UserCreate, session: Session = Depends(get_session)):
    # 1. Verify OTP first
    verify_otp_logic(session, user_in.email, user_in.otp)

    # 2. Check if user exists (Email)
    existing_user = session.execute(select(User).where(User.email == user_in.email)).scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 3. Check if Registration Number exists (if provided)
    if user_in.registration_number:
        existing_reg = session.execute(select(User).where(User.registration_number == user_in.registration_number)).scalars().first()
        if existing_reg:
             raise HTTPException(status_code=400, detail="Registration Number already registered")

    hashed_password = get_password_hash(user_in.password)
    
    # Force role to student and save details
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        role="student", # Forced
        registration_number=user_in.registration_number,
        branch=user_in.branch,
        section=user_in.section,
        semester=user_in.semester,
        is_active=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/reset-password")
def reset_password(data: PasswordReset, session: Session = Depends(get_session)):
    # 1. Verify OTP
    verify_otp_logic(session, data.email, data.otp)
    
    # 2. Get User
    user = session.execute(select(User).where(User.email == data.email)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    # 3. Update Password
    user.password_hash = get_password_hash(data.new_password)
    session.add(user)
    session.commit()
    
    return {"message": "Password updated successfully. You can now login."}

from sqlalchemy import func
from app.models import EventRegistration

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Calculate event participation count
    count = session.query(func.count(EventRegistration.id)).filter(EventRegistration.student_id == current_user.id).scalar()
    
    # Convert ORM to dict and add extra field
    user_data = UserOut.model_validate(current_user).model_dump()
    user_data["events_participated_count"] = count or 0
    return user_data
