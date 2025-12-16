import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.yucchin import UserYucchin
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        print("--- Checking Users ---")
        result = await db.execute(select(User))
        users = result.scalars().all()
        for u in users:
            print(f"User: {u.id}, {u.username}, {u.email}")

        print("\n--- Checking Yucchins ---")
        result = await db.execute(select(UserYucchin))
        yucchins = result.scalars().all()
        for y in yucchins:
            print(f"Yucchin: {y.id}, User: {y.user_id}, Type: {y.yucchin_type}, Name: {y.yucchin_name}")

if __name__ == "__main__":
    asyncio.run(main())
