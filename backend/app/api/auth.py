from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginData(BaseModel):
    email: str
    password: str

class RegisterData(BaseModel):
    email: str
    password: str
    name: str

@router.post("/login")
async def login(data: LoginData):
    """
    🔐 GhostTrack Login
    """
    print(f"🔐 GhostTrack - Login attempt: {data.email}")
    return {
        "service": "GhostTrack Auth",
        "message": "Login endpoint ready",
        "status": "coming_soon"
    }

@router.post("/register")
async def register(data: RegisterData):
    """
    🔐 GhostTrack Registration
    """
    print(f"🔐 GhostTrack - Registration: {data.email}")
    return {
        "service": "GhostTrack Auth",
        "message": "Registration endpoint ready",
        "status": "coming_soon"
    }