import requests
import sys

BASE_URL = "http://localhost:8000"

def test_signup_student():
    print("\n--- Testing Student Signup ---")
    email = "student_test_v2@example.com"
    payload = {
        "email": email,
        "password": "password123",
        "name": "Test Student V2",
        "otp": "123456", # Mock OTP success if backend allows or we simulate it
        "registration_number": "REG12345",
        "branch": "CSE",
        "section": "A",
        "year": 3,
        "role": "admin" # ATTEMPTING ESCALATION
    }
    
    # First send OTP
    try:
        requests.post(f"{BASE_URL}/auth/send-otp", json={"email": email, "reason": "signup"})
        # We need the OTP code from backend logs or if we disabled email sending. 
        # Assuming we can't extract it easily without looking at backend logs. 
        # For this test script to work, we might need to mock OTP verify or cheat.
        # But wait, looking at `api/auth.py`, it sends email synchronously.
        # I can just inject the OTP into the DB directly for testing?
        pass
    except Exception as e:
        print(f"OTP Send Error: {e}")

    # Cheating: Since I can't read the email, I will simulate the OTP verification logic or 
    # just create a user via a test-only endpoint or rely on the previous `create_test_users.py` approach?
    # Actually, let's create a specialized python script that interacts with the DB to inject OTP.
    pass

if __name__ == "__main__":
    print("Use `backend/create_test_users.py` or manual testing.")
