from app.core.database import engine
from sqlalchemy import text
import sys

def add_club_id_to_announcements():
    print("Adding club_id column to announcements table...")
    try:
        with engine.connect() as connection:
            stmt = text("ALTER TABLE announcements ADD COLUMN club_id INTEGER NULL, ADD CONSTRAINT fk_announcements_clubs FOREIGN KEY (club_id) REFERENCES clubs(id);")
            connection.execute(stmt)
            connection.commit()
            print("Successfully added club_id to announcements table.")
    except Exception as e:
        print(f"Error adding column (might already exist): {e}")

if __name__ == "__main__":
    add_club_id_to_announcements()
