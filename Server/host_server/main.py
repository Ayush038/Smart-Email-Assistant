from fastapi import FastAPI
from routes.db_routes import router as email_router
from auth.routes import router as auth_router
from storage.mongo_client import get_database
from dependency import agent
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(email_router)
app.include_router(auth_router)


@app.on_event("startup")
async def startup():
    await agent.start()


@app.on_event("shutdown")
async def shutdown():
    await agent.stop()


@app.get("/")
def root():
    return {"message": "Smart Email Assistant API is running"}


@app.get("/health")
def health_check():
    try:
        db = get_database()
        db.command("ping")
        return {"status": "MongoDB connected"}
    except Exception as e:
        return {
            "status": "MongoDB connection failed",
            "error": str(e),
        }