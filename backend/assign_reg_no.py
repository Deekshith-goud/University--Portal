from sqlalchemy import create_engine, text
from app.core.database import DATABASE_URL

def assign_reg_no():
    engine = create_engine(DATABASE_URL)
    email = "student@university.du"
    reg_no = "242FA04197"
    
    with engine.connect() as connection:
        # Check user
        result = connection.execute(text("SELECT id, name, registration_number FROM users WHERE email = :email"), {"email": email}).fetchone()
        
        if not result:
            print(f"Error: User with email {email} not found.")
            return

        print(f"Found User: {result[1]} (ID: {result[0]}), Current Reg No: {result[2]}")
        
        # Update
        try:
            connection.execute(text("UPDATE users SET registration_number = :reg_no WHERE email = :email"), {"reg_no": reg_no, "email": email})
            connection.commit()
            print(f"Successfully updated registration number to {reg_no}")
        except Exception as e:
            print(f"Error updating: {e}")

if __name__ == "__main__":
    assign_reg_no()
