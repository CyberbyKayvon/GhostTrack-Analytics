from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.event import Event
from sqlalchemy import func

router = APIRouter()


@router.get("/alerts")
async def get_alerts(
        site_id: str = "ghosttrack-test-dashboard",
        db: Session = Depends(get_db)
):
    """
    Get security alerts (bot detections)
    """
    # Get recent bot detections
    bot_events = db.query(Event).filter(
        Event.site_id == site_id,
        Event.is_bot == True
    ).order_by(Event.timestamp.desc()).limit(10).all()

    alerts = [
        {
            "type": "Bot Detected",
            "details": f"Bot activity from {event.ip_address or 'unknown IP'}",
            "timestamp": event.timestamp.isoformat(),
            "severity": "medium"
        }
        for event in bot_events
    ]

    return {"alerts": alerts}


@router.get("/suspicious")
async def get_suspicious_activity(
        site_id: str = "ghosttrack-test-dashboard",
        db: Session = Depends(get_db)
):
    """
    Get suspicious activity patterns
    """
    # Find sessions with high event frequency (potential bots)
    suspicious_sessions = db.query(
        Event.session_id,
        func.count(Event.id).label('event_count')
    ).filter(
        Event.site_id == site_id
    ).group_by(Event.session_id).having(
        func.count(Event.id) > 10
    ).all()

    return {
        "suspicious_sessions": [
            {
                "session_id": session.session_id,
                "event_count": session.event_count,
                "risk_level": "high" if session.event_count > 20 else "medium"
            }
            for session in suspicious_sessions
        ]
    }