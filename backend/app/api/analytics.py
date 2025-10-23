from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_analytics():
    """Get analytics overview"""
    return {
        "message": "Analytics endpoint - coming soon",
        "total_events": 0,
        "total_visitors": 0
    }