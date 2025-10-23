from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_threats():
    """Get threat feed"""
    return {
        "message": "Threats endpoint - coming soon",
        "threats": []
    }