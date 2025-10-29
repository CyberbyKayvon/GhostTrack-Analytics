from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
from app.core.database import init_db
from app.core.config import settings
from app.api import events, analytics, auth, threats

# Get the directory where main.py is located
BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="GhostTrack API",
    description="Security-first analytics API for e-commerce",
    version="0.1.0"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    print("👻 GhostTrack API Starting...")
    print("📊 Initializing database...")
    try:
        init_db()
        print("✅ GhostTrack Database ready!")
    except Exception as e:
        print(f"⚠️ Database warning: {e}")

# FIXED CORS - Allow kayvontennis.com
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://kayvontennis.com",
        "http://kayvontennis.com",
        "https://www.kayvontennis.com",
        "http://www.kayvontennis.com",
        "https://dashboard.ghosttrack.app",  # ← ADD THIS
        "*"  # Allow all origins (less secure, but works for testing)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(threats.router, prefix="/api/v1/threats", tags=["threats"])

# Serve the tracker JavaScript file
tracker_dir = BASE_DIR.parent / "tracker"
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