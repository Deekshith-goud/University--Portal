import requests
import datetime
import json

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
EVENTS_URL = f"{BASE_URL}/college/events" # No trailing slash generally for POST

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

    # 2. Create Event Payload
    # Mimic the frontend payload exactly
    payload = {
        "title": "HTTP Debug Event",
        "description": "Testing via HTTP",
        "date": (datetime.datetime.now() + datetime.timedelta(days=5)).isoformat(), # ISO string
        "venue": "Lab 2",
        "registration_deadline": (datetime.datetime.now() + datetime.timedelta(days=2)).isoformat(),
        "event_type": "Workshop",
        "participation_type": "individual",
        "min_team_size": 1,
        "max_team_size": 1,
        "image_poster": "",
        "eligibility": ["1", "3"],          # List[str]
        "target_departments": [],           # Empty list
        "attachments": [{"name": "Doc", "url": "http://test.com"}],
        "is_open": True,
        "contact_email": "test@test.com",
        "contact_phone": "1234567890",
        "coordinator_name": "Dr. Smith",
        "coordinator_details": "9988776655"
    }
    
    print("\nSending Payload:")
    print(json.dumps(payload, indent=2))
    
    resp = requests.post(EVENTS_URL, json=payload, headers=headers)
    
    print(f"\nResponse Code: {resp.status_code}")
    print(f"Response Body: {resp.text}")

except Exception as e:
    print(f"Error: {e}")
