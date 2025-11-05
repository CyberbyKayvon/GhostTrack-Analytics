from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import jwt

router = APIRouter()


class DashboardLoginRequest(BaseModel):
    password: str


@router.post("/dashboard-login")
async def dashboard_login(request: DashboardLoginRequest):
    """
    Dashboard password authentication
    Returns JWT token valid for 6 hours
    """
    # Get password from environment
    correct_password = os.getenv("DASHBOARD_PASSWORD", "testing2025")

    # Verify password
    if request.password != correct_password:
        raise HTTPException(status_code=401, detail="Invalid password")

    # Create JWT token with 6 hour expiration
    secret_key = os.getenv("SECRET_KEY", "xJMGetstBD35Q3DBz7e0PuRPB9fptXdxdC57cIfLDwU")

    payload = {
        "type": "dashboard_access",
        "exp": datetime.utcnow() + timedelta(hours=6),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, secret_key, algorithm="HS256")

    return {
        "success": True,
        "token": token,
        "expires_in": 21600  # 6 hours in seconds
    }


@router.post("/verify-token")
async def verify_token(token: str):
    """
    Verify if a JWT token is still valid
    """
    try:
        secret_key = os.getenv("SECRET_KEY", "xJMGetstBD35Q3DBz7e0PuRPB9fptXdxdC57cIfLDwU")
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])

        # Check if token type is correct
        if payload.get("type") != "dashboard_access":
            raise HTTPException(status_code=401, detail="Invalid token type")

        return {"valid": True, "expires_at": payload.get("exp")}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/login")
async def login():
    """
    User login (for future multi-user support)
    """
    return {"message": "Login endpoint - coming soon"}


@router.post("/register")
async def register():
    """
    User registration (for future multi-user support)
    """
    return {"message": "Register endpoint - coming soon"}