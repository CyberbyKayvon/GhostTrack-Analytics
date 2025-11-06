from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.database import init_db
from app.core.config import settings
from app.api import events, analytics, auth, threats, migrate, geolocation
from routes.heatmap import router as heatmap_router

# Get the directory where main.py is located
BASE_DIR = Path(__file__).resolve().parent

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="GhostTrack API",
    description="Security-first analytics API for e-commerce",
    version="0.1.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    print("GhostTrack API Starting...")
    print("Initializing database...")
    try:
        init_db()
        print("GhostTrack Database ready!")
    except Exception as e:
        print(f"Database warning: {e}")

# CORS - Allow all origins for public tracking script (like Google Analytics)
# This is required for the tracking script to work on any website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for public tracking
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(threats.router, prefix="/api/v1/threats", tags=["threats"])
app.include_router(heatmap_router, prefix="/api/v1/heatmap", tags=["heatmap"])
app.include_router(migrate.router, prefix="/api/v1/migrate", tags=["migrate"])
app.include_router(geolocation.router, prefix="/api/v1/geolocation", tags=["geolocation"])

# Serve the tracker JavaScript file
tracker_dir = BASE_DIR / "tracker"
if tracker_dir.exists():
    app.mount("/tracker", StaticFiles(directory=str(tracker_dir)), name="tracker")

# Serve test dashboard
@app.get("/test")
async def serve_test_dashboard():
    return FileResponse(str(BASE_DIR / "test.html"))

@app.get("/")
async def root():
    return {
        "message": "GhostTrack API",
        "version": "0.1.0",
        "docs": "/docs",
        "test_dashboard": "/test"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}