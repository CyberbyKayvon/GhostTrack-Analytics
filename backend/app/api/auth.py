from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def login():
    """User login"""
    return {"message": "Login endpoint - coming soon"}

@router.post("/register")
async def register():
    """User registration"""
    return {"message": "Register endpoint - coming soon"}