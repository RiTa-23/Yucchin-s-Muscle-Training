from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from app.routers import auth, users, pose

from contextlib import asynccontextmanager
from app.database import engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models import user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # テスト環境か本番環境かを判定し、マイグレーションの要否を判断する
    # 現時点では、指示に従い、単純な create_all を実行する
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pose.router)

@app.get("/")
async def get():
    return {"message": "Hello from FastAPI on Railway"}