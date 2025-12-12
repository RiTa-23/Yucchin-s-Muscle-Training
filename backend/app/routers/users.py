from fastapi import APIRouter

router = APIRouter()

@router.get("/users")
async def users_root():
    return {"message": "Users router placeholder"}