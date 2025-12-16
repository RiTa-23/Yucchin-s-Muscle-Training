import asyncio
import sys
import os

# Set path to allow imports (add 'backend' directory to sys.path)
# current file is in backend/create_test_data.py
# dirname is backend/
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal
from app.crud.user import create_user, get_user_by_username
from app.crud.yucchin import create_user_yucchin
from app.schemas.user import UserCreate
from app.schemas.yucchin import UserYucchinCreate
from app.models.yucchin import UserYucchin
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        username = "testuser"
        email = "test@example.com"
        password = "password"

        print(f"Checking if user '{username}' exists...", flush=True)
        user = await get_user_by_username(db, username)

        if not user:
            print(f"Creating user '{username}'...", flush=True)
            user_in = UserCreate(username=username, email=email, password=password)
            user = await create_user(db, user_in)
            print(f"User '{username}' created with ID: {user.id}", flush=True)
        else:
            print(f"User '{username}' already exists with ID: {user.id}", flush=True)

        # Define Yucchins to add
        yucchins_to_add = [
            {"type": 1, "name": "ノーマルゆっちん1"},
            {"type": 101, "name": "レアゆっちん1"},
            {"type": 102, "name": "レアゆっちん2"},
        ]

        print("Adding Yucchins...")
        for y_data in yucchins_to_add:
            # Check if already exists to avoid duplicates (optional but good for re-running)
            # This is a simple check; in production you might have unique constraints
            stmt = select(UserYucchin).where(
                UserYucchin.user_id == user.id,
                UserYucchin.yucchin_type == y_data["type"]
            )
            existing = await db.execute(stmt)
            if existing.scalars().first():
                 print(f"  - Yucchin Type {y_data['type']} already exists. Skipping.")
            else:
                y_in = UserYucchinCreate(yucchin_type=y_data["type"], yucchin_name=y_data["name"])
                await create_user_yucchin(db, y_in, user.id)
                print(f"  - Added Yucchin Type {y_data['type']} ({y_data['name']})")

        print("\nTest data setup complete!")
        print("--------------------------------------------------")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print("--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(main())
