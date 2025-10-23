from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="GhostTrack API",
    description="Security-first analytics API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "GhostTrack API is running!",
        "version": "0.1.0",
        "status": "online"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}