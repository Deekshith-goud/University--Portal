import mysql.connector

def update_schema():
    try:
        user = "root"
        password = "Deekshith@mysql"
        host = "localhost"
        db_name = "student_portal_db"
        port = 3306

        print(f"Connecting to {host}...")
        
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=db_name,
            port=port
        )
        cursor = conn.cursor()

        # Add columns
        columns = [
            ("attachment_url", "VARCHAR(255) NULL"),
            ("branch", "VARCHAR(50) NULL"),
            ("section", "VARCHAR(50) NULL")
        ]

        for col_name, col_def in columns:
            try:
                print(f"Adding column {col_name}...")
                cursor.execute(f"ALTER TABLE assignments ADD COLUMN {col_name} {col_def}")
                print(f"Added {col_name}")
            except mysql.connector.Error as err:
                if err.errno == 1060: # Duplicate column name
                    print(f"Column {col_name} already exists.")
                else:
                    print(f"Error adding {col_name}: {err}")

        conn.commit()
        cursor.close()
        conn.close()
        print("Schema update complete.")

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    update_schema()
