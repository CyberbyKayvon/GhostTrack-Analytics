from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import hashlib
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.database import get_db
from app.models.event import Event

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


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


def generate_fallback_session_id(ip_address: str, user_agent: str) -> str:
    """
    Generate a fallback session ID based on IP + User Agent
    This is a backup when frontend doesn't provide session_id
    Uses SHA-256 for cryptographic security
    """
    session_string = f"{ip_address}_{user_agent}_{datetime.utcnow().date()}"
    return hashlib.sha256(session_string.encode()).hexdigest()[:32]


@router.post("/track")
@limiter.limit("100/minute")  # Limit to 100 requests per minute per IP
async def track_event(request: Request, event_data: dict, db: Session = Depends(get_db)):
    """
    Track a new event with professional-grade accuracy
    Rate limited to 100 requests/minute per IP to prevent DoS attacks

    This endpoint is designed to work with:
    - localStorage-based session IDs (preferred)
    - Fallback session generation (if frontend doesn't provide)
    - Accurate IP capture through proxies/load balancers
    - Bot detection
    """
    try:
        # Extract data with defaults
        site_id = event_data.get("site_id", "ghosttrack-test-dashboard")
        event_type = event_data.get("event_type", "pageview")
        url = event_data.get("url", "/")
        referrer = event_data.get("referrer")
        user_agent = event_data.get("user_agent") or request.headers.get("User-Agent", "Unknown")
        session_id = event_data.get("session_id")
        is_bot = event_data.get("is_bot", False)

        # Get real IP address (works through proxies)
        ip_address = get_client_ip(request)

        # CRITICAL: Handle missing session_id
        if not session_id or session_id == "unknown" or session_id == "":
            # Generate fallback session ID
            session_id = generate_fallback_session_id(ip_address, user_agent)
            print(f"⚠️  No session_id provided, generated fallback: {session_id}")
        else:
            print(f"✅ Received session_id: {session_id}")

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

        print(f"📊 Event tracked: {event_type} | Session: {session_id} | IP: {ip_address}")

        return {
            "status": "success",
            "event_id": new_event.id,
            "message": "Event tracked successfully",
            "ip_captured": ip_address,
            "session_id": session_id,
            "event_type": event_type
        }

    except Exception as e:
        db.rollback()
        print(f"❌ Error tracking event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint for tracking service"""
    return {
        "status": "healthy",
        "service": "event-tracking",
        "timestamp": datetime.utcnow().isoformat()
    }