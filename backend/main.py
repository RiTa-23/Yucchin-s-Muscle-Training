from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app.routers import auth, users, pose, settings

from contextlib import asynccontextmanager
from app.database import engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models import user, settings as settings_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # テスト環境か本番環境かを判定し、マイグレーションの要否を判断する
    # 現時点では、指示に従い、単純な create_all を実行する
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:5174",  # Second Vite port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pose.router)
app.include_router(settings.router, prefix="/settings", tags=["settings"])

@app.get("/")
async def get():
    return {"message": "Hello from FastAPI on Railway"}