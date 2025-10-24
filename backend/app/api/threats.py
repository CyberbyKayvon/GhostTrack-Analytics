from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_threats():
    """
    🛡️ GhostTrack Threat Detection
    """
    return {
        "service": "GhostTrack Security",
        "message": "Threat detection active",
        "threats": [],
        "total_threats": 0,
        "blocked_ips": 0,
        "status": "monitoring"
    }

@router.get("/feed")
async def get_threat_feed():
    """
    🛡️ GhostTrack Threat Feed
    """
    return {
        "service": "GhostTrack Threat Feed",
        "recent_threats": [],
        "severity": {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
    }