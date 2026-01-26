import requests
import sys

BASE_URL = "http://localhost:8000"

def test_signup_student():
    print("\n--- Testing Student Signup ---")
    email = "student_test_verification@example.com"
    payload = {
        "email": email,
        "password": "password123",
        "name": "Test Student Verification",
        "otp": "123456", 
        "registration_number": "REG-VERIFY-001",
        "branch": "CSE",
        "section": "A",
        "year": 3,
        "role": "admin" # ATTEMPTING ESCALATION
    }
    
    # 1. Register
    try:
        print("Attempting to register with role='admin'...")
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if response.status_code == 200:
            user = response.json()
            print("Registration Successful!")
            print(f"Assigned Role: {user['role']}")
            print(f"Assigned Year: {user['year']}")
            
            if user['role'] != 'student':
                print("❌ FAILED: Role escalation occurred!")
                sys.exit(1)
            else:
                print("✅ PASSED: Role escalation prevented. Role is 'student'.")
        else:
            print(f"Registration Failed: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"Request Error: {e}")
        sys.exit(1)

    # 2. Login
    try:
        print("\n--- Testing Login & Token ---")
        login_data = {"username": email, "password": "password123"}
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if response.status_code == 200:
            token = response.json()['access_token']
            print("Login Successful. Token received.")
            
            # 3. Verify ME
            headers = {"Authorization": f"Bearer {token}"}
            me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            me = me_resp.json()
            print(f"Me Endpoint Data: Role={me['role']}, Year={me['year']}")
            if me['year'] == 3:
                 print("✅ PASSED: Year correctly saved.")
            else:
                 print("❌ FAILED: Year not saved correctly.")
        else:
            print(f"Login Failed: {response.text}")
    except Exception as e:
        print(f"Login Error: {e}")

if __name__ == "__main__":
    test_signup_student()
