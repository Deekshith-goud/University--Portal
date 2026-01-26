import requests
import json

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"

# 1. Login
try:
    print(f"Logging in to {LOGIN_URL}...")
    resp = requests.post(LOGIN_URL, data={"username": "admin@university.edu", "password": "admin123"})
    if resp.status_code != 200:
        print(f"Login Failed: {resp.status_code} {resp.text}")
        exit(1)
    
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login Success. Token acquired.")

    # 2. Get Events (to find a valid ID)
    resp = requests.get(f"{BASE_URL}/college/events", headers=headers)
    events = resp.json()
    if not events:
        print("No events found. Create one first.")
        exit(1)
        
    event_id = events[0]['id']
    print(f"Targeting Event ID: {event_id}")

    # 3. Register Team Payload
    # Mimic frontend
    payload = {
        "team_name": "Debug Team",
        "team_size": 2,
        "student_phone": "9876543210",
        "student_name": "Team Lead Debug",
        "registration_number": "LEAD123",
        "branch": "CSE",
        "section": "A",
        # member_details is passed as a serialized JSON string in frontend
        "member_details": json.dumps([
            {"name": "Member 1", "reg_no": "MEM1", "branch": "ECE", "section": "B"}
        ]),
        "student_email": "lead@debug.com"
    }
    
    print("\nSending Payload:")
    print(json.dumps(payload, indent=2))
    
    resp = requests.post(f"{BASE_URL}/college/events/{event_id}/register", json=payload, headers=headers)
    
    print(f"\nResponse Code: {resp.status_code}")
    print(f"Response Body: {resp.text}")

except Exception as e:
    print(f"Error: {e}")
