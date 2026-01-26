from app.core.database import engine, Base
from app.models import Club, ClubMembership
import sys

def update_schema():
    print("Updating schema for Clubs...")
    try:
        # This will create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("Schema updated successfully!")
    except Exception as e:
        print(f"Error updating schema: {e}")
        sys.exit(1)

if __name__ == "__main__":
    update_schema()
