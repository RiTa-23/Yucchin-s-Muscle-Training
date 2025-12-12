from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from app.routers import auth, users, pose

app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pose.router)

@app.get("/")
async def get():
    return {"message": "Hello from FastAPI on Railway"}