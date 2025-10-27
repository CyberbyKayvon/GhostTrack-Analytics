from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.models.event import Event

router = APIRouter()


class EventCreate(BaseModel):
    site_id: str
    event_type: str
    url: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    session_id: Optional[str] = None
    is_bot: Optional[bool] = False


def get_client_ip(request: Request) -> str:
    """Extract real client IP from request"""
    # Check for forwarded IP (from proxies/load balancers)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct client IP
    if request.client:
        return request.client.host

    return "unknown"


@router.post("/track")
async def track_event(request: Request, event_data: dict, db: Session = Depends(get_db)):
    """
    Track a new event with improved session handling

    Session IDs are now persistent and unique per browser/device.
    The frontend generates and maintains these IDs in localStorage.
    """
    try:
        # Extract data
        site_id = event_data.get("site_id", "ghosttrack-test-dashboard")
        event_type = event_data.get("event_type", "pageview")
        url = event_data.get("url", "/")
        referrer = event_data.get("referrer")
        user_agent = event_data.get("user_agent")
        session_id = event_data.get("session_id", "unknown")
        is_bot = event_data.get("is_bot", False)

        # Get real IP address
        ip_address = get_client_ip(request)

        # CRITICAL: Ensure session_id is persistent
        # If session_id is still "unknown", this indicates frontend issue
        if session_id == "unknown":
            # Fallback: create temporary session based on IP + User Agent
            # But this should be fixed on frontend
            import hashlib
            temp_session = f"{ip_address}_{user_agent}"
            session_id = hashlib.md5(temp_session.encode()).hexdigest()[:12]

        # Convert boolean to integer for database
        is_bot_int = 1 if is_bot else 0

        # Create event
        new_event = Event(
            site_id=site_id,
            event_type=event_type,
            url=url,
            referrer=referrer,
            user_agent=user_agent,
            ip_address=ip_address,
            session_id=session_id,
            is_bot=is_bot_int,
            timestamp=datetime.utcnow()
        )

        db.add(new_event)
        db.commit()
        db.refresh(new_event)

        return {
            "status": "success",
            "event_id": new_event.id,
            "message": "Event tracked successfully",
            "ip_captured": ip_address,
            "session_id": session_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
