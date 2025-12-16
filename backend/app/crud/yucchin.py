from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.yucchin import UserYucchin
from app.schemas.yucchin import UserYucchinCreate

async def get_yucchins(db: AsyncSession, user_id: int):
    result = await db.execute(select(UserYucchin).where(UserYucchin.user_id == user_id))
    return result.scalars().all()

async def create_user_yucchin(db: AsyncSession, yucchin: UserYucchinCreate, user_id: int):
    db_yucchin = UserYucchin(
        user_id=user_id,
        yucchin_type=yucchin.yucchin_type,
        yucchin_name=yucchin.yucchin_name
    )
    db.add(db_yucchin)
    await db.commit()
    await db.refresh(db_yucchin)
    return db_yucchin
