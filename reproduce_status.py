
import requests
import json

BASE_URL = "http://localhost:8000"
EMAIL = "student@university.du"
PASSWORD = "student123"

def login():
    url = f"{BASE_URL}/auth/login"
    data = {"username": EMAIL, "password": PASSWORD}
    try:
        response = requests.post(url, data=data)
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        print(f"Login failed: {e}")
        if response.content:
            print(response.content)
        return None

def check_status(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get Assignments
    print("\nFetching Assignments...")
    try:
        r = requests.get(f"{BASE_URL}/assignments", headers=headers)
        r.raise_for_status()
        assignments = r.json()
        print(f"Found {len(assignments)} assignments.")
        for a in assignments:
            print(f" - ID: {a['id']}, Title: {a['title']}")
    except Exception as e:
        print(f"Failed to fetch assignments: {e}")
        return

    # 2. Get My Submissions
    print("\nFetching My Submissions...")
    try:
        r = requests.get(f"{BASE_URL}/assignments/me/submissions", headers=headers)
        r.raise_for_status()
        submissions = r.json()
        print(f"Found {len(submissions)} submissions.")
        for s in submissions:
            print(f" - ID: {s['id']}, AssignmentID: {s['assignment_id']}, File: {s['file_url']}")
            
        # Match
        submitted_ids = {s['assignment_id'] for s in submissions}
        print(f"\nSubmitted Assignment IDs (Set): {submitted_ids}")
        
        for a in assignments:
            status = "Submitted" if a['id'] in submitted_ids else "Pending"
            print(f"Assignment {a['id']} ('{a['title']}') -> Status: {status}")
            
    except Exception as e:
        print(f"Failed to fetch submissions: {e}")
        if r.content:
            print(r.content)

if __name__ == "__main__":
    token = login()
    if token:
        check_status(token)
