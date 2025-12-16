from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.crud import create_user, get_user_by_email, get_user_by_username, update_user
from app.models.user import User

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Check if user already exists by email
        db_user = await get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このメールアドレスは既に登録されています"
            )
        
        # Check if user already exists by username
        db_user_by_name = await get_user_by_username(db, username=user.username)
        if db_user_by_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このユーザー名は既に使用されています"
            )

        return await create_user(db=db, user=user)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="サインアップ処理中にエラーが発生しました"
        )

@router.get("/users")
async def users_root():
    return {"message": "Users router active"}

@router.put("/users/me", response_model=UserResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Check if new username is already taken
        if user_update.username and user_update.username != current_user.username:
            existing_user = await get_user_by_username(db, username=user_update.username)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="このユーザー名は既に使用されています"
                )
        
        # Check if new email is already taken
        if user_update.email and user_update.email != current_user.email:
             existing_user = await get_user_by_email(db, email=user_update.email)
             if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="このメールアドレスは既に登録されています"
                )

        return await update_user(db, db_user=current_user, user_in=user_update)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザー情報の更新中にエラーが発生しました"
        )