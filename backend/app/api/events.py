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
    """Main event ingestion endpoint"""
    print(f"📊 Event received: {event.event_type} from {event.site_id}")
    return {
        "status": "success",
        "event_id": f"evt_{datetime.utcnow().timestamp()}",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/batch")
async def track_batch_events(events: list[EventData]):
    """Batch event ingestion"""
    print(f"📊 Batch received: {len(events)} events")
    return {"status": "success", "processed": len(events)}