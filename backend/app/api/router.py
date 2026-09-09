from fastapi import APIRouter
from app.api.routes import health, analyze, chat

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat & Q&A"])
