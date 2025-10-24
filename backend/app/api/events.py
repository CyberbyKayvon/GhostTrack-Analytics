from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.database import get_db
from app.models.event import Event

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
    """
    Main event ingestion endpoint
    This is where the JavaScript tracker sends data
    """
    try:
        # Create database record
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

        print(f"✅ 📊 Event SAVED to database! ID: {db_event.id}, Type: {event.event_type}, Site: {event.site_id}")

        return {
            "status": "success",
            "event_id": db_event.id,
            "timestamp": db_event.timestamp.isoformat()
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/batch")
async def track_batch_events(events: list[EventData], request: Request, db: Session = Depends(get_db)):
    """
    Batch event ingestion for better performance
    """
    try:
        db_events = []
        for event in events:
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
            db_events.append(db_event)

        db.bulk_save_objects(db_events)
        db.commit()

        print(f"✅ 📊 Batch SAVED! {len(db_events)} events saved to database")

        return {"status": "success", "processed": len(db_events)}
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving batch: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")