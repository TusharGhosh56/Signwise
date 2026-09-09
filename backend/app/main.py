import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("signwise.backend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Signwise AI Backend: Plain-English contract analysis, risk detection, and negotiation intelligence.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.on_event("startup")
async def startup_banner():
    logger.info("=" * 60)
    logger.info("🚀 %s v%s started", settings.PROJECT_NAME, settings.VERSION)
    logger.info("📡 Running on http://%s:%d", settings.HOST, settings.PORT)
    logger.info("📚 Swagger UI: http://%s:%d/docs", settings.HOST, settings.PORT)
    logger.info("🔗 Allowed CORS Origins: %s", settings.CORS_ORIGINS)
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        logger.info("✨ Google Gemini Engine: ACTIVE (%s)", settings.GEMINI_MODEL)
    else:
        logger.info("💡 Google Gemini Engine: FALLBACK DEMO MODE (Set GEMINI_API_KEY in .env)")
    logger.info("=" * 60)
