from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.database import get_db
from app.models.event import Event
from app.services.bot_detection import detect_bot
from app.services.threat_analysis import analyze_threat

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
async def track_event(event: EventData, request: Request, db: Session = Depends(get_db)):
    """Track a single event"""
    try:
        # Bot detection
        is_bot = detect_bot(event.user_agent)

        # Threat analysis
        threat_score = analyze_threat(event.url, event.user_agent, request.client.host if request.client else None)

        # Create event
        db_event = Event(
            site_id=event.site_id,
            event_type=event.event_type,
            url=event.url,
            referrer=event.referrer,
            user_agent=event.user_agent,
            session_id=event.session_id,
            ip_address=request.client.host if request.client else None,
            event_metadata=event.metadata,
            timestamp=datetime.utcnow(),
            is_bot=0,
            threat_score=0.0,
            blocked=0
        )

        db.add(db_event)
        db.commit()
        db.refresh(db_event)

        print(f"✅ Event SAVED to database! ID: {db_event.id}, Type: {event.event_type}, Site: {event.site_id}")

        return {
            "status": "success",
            "event_id": db_event.id,
            "is_bot": is_bot,
            "threat_score": threat_score
        }
    except Exception as e:
        print(f"❌ Error saving event: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/track/batch")
async def track_batch_events(events: list[EventData], request: Request, db: Session = Depends(get_db)):
    """Track multiple events at once"""
    try:
        saved_events = []
        for event in events:
            is_bot = detect_bot(event.user_agent)
            threat_score = analyze_threat(event.url, event.user_agent, request.client.host if request.client else None)

            db_event = Event(
                site_id=event.site_id,
                event_type=event.event_type,
                url=event.url,
                referrer=event.referrer,
                user_agent=event.user_agent,
                session_id=event.session_id,
                ip_address=request.client.host if request.client else None,
                event_metadata=event.metadata,
                timestamp=datetime.utcnow(),
                is_bot=0,
                threat_score=0.0,
                blocked=0
            )

            db.add(db_event)
            saved_events.append(db_event)

        db.commit()

        return {
            "status": "success",
            "events_saved": len(saved_events)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))