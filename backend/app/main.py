from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import events, analytics, auth, threats

app = FastAPI(
    title="GhostTrack API",
    description="Security-first analytics API for e-commerce",
    version="0.1.0"
)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting GhostTrack API...")
    print("📊 Initializing database...")
    try:
        init_db()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize database: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(threats.router, prefix="/api/v1/threats", tags=["threats"])

@app.get("/")
async def root():
    return {
        "message": "GhostTrack API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}