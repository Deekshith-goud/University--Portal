from sqlalchemy import create_engine, text
from app.core.database import DATABASE_URL

def update_schema():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        print("Adding semester to notes...")
        try:
            connection.execute(text("ALTER TABLE notes ADD COLUMN semester INTEGER NULL"))
            print("Added semester column.")
        except Exception as e:
            print(f"Column might already exist: {e}")
            
        connection.commit()
        print("Schema update finished.")

if __name__ == "__main__":
    update_schema()
