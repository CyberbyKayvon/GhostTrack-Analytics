from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

router = APIRouter()

class EventData(BaseModel):
    site_id: str
    event_type: str
    url: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@router.post("/track")
async def track_event(event: EventData):
    """
    🎯 GhostTrack Event Tracking
    Main event ingestion endpoint
    """
    print(f"👻 GhostTrack - Event received: {event.event_type} from {event.site_id}")
    return {
        "status": "success",
        "message": "Event tracked by GhostTrack",
        "event_id": f"evt_{datetime.utcnow().timestamp()}",
        "event_type": event.event_type,
        "site_id": event.site_id,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/batch")
async def track_batch_events(events: list[EventData]):
    """
    🎯 GhostTrack Batch Event Tracking
    """
    print(f"👻 GhostTrack - Batch received: {len(events)} events")
    return {
        "status": "success",
        "message": "Batch tracked by GhostTrack",
        "processed": len(events),
        "timestamp": datetime.utcnow().isoformat()
    }