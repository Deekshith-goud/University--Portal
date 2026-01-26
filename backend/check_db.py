from app.core.database import get_session
from app.api.events import read_events
from app.models import User
import sys

try:
    print("Checking DB...")
    db = next(get_session())
    u = User(role='admin', id=1)
    # Mocking authenticated user logic if needed, but read_events relies on user only for filtering logic if not admin
    # Actually require_admin or similar depends might be tricky in script, but read_events just takes user object.
    
    events = read_events(db, u)
    print(f"Success! Found {len(events)} events.")
    for e in events:
        print(e)
except Exception as e:
    print(f"DB Error: {e}")
    sys.exit(1)
