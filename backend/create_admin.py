import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import bcrypt
import uuid

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

# Load environment variables
load_dotenv(backend_dir / '.env')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_admin_user():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    try:
        # Check if admin user already exists
        existing_admin = await db.users.find_one({"email": "admin@gmail.com"})
        if existing_admin:
            print("✅ Admin user already exists!")
            return
        
        # Create admin user
        admin_data = {
            "id": str(uuid.uuid4()),
            "email": "admin@gmail.com",
            "password_hash": hash_password("admin"),
            "company": "AshLink Administration",
            "contact_person": "System Administrator",
            "phone": "+91-9999999999",
            "role": "admin",
            "address": "AshLink Headquarters",
            "city": "Mumbai",
            "state": "Maharashtra",
            "kyc_verified": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Insert admin user
        await db.users.insert_one(admin_data)
        print("✅ Admin user created successfully!")
        print("   Email: admin@gmail.com")
        print("   Password: admin")
        print("   Role: admin")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())