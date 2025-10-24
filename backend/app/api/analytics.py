from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.event import Event

router = APIRouter()


@router.get("/")
async def get_analytics(db: Session = Depends(get_db)):
    """
    📊 GhostTrack Analytics Dashboard - REAL DATA FROM DATABASE
    """
    try:
        # Total events
        total_events = db.query(func.count(Event.id)).scalar() or 0

        # Unique visitors (by session_id)
        unique_visitors = db.query(func.count(func.distinct(Event.session_id))).filter(
            Event.session_id.isnot(None)
        ).scalar() or 0

        # Events today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        events_today = db.query(func.count(Event.id)).filter(
            Event.timestamp >= today_start
        ).scalar() or 0

        # Recent events (last 10)
        recent_events = db.query(Event).order_by(Event.timestamp.desc()).limit(10).all()

        # Top event types
        top_events = db.query(
            Event.event_type,
            func.count(Event.id).label('count')
        ).group_by(Event.event_type).order_by(func.count(Event.id).desc()).limit(5).all()

        # Top sites
        top_sites = db.query(
            Event.site_id,
            func.count(Event.id).label('count')
        ).group_by(Event.site_id).order_by(func.count(Event.id).desc()).limit(5).all()

        return {
            "service": "GhostTrack Analytics",
            "status": "operational",
            "summary": {
                "total_events": total_events,
                "unique_visitors": unique_visitors,
                "events_today": events_today
            },
            "recent_events": [
                {
                    "id": e.id,
                    "event_type": e.event_type,
                    "site_id": e.site_id,
                    "url": e.url,
                    "session_id": e.session_id,
                    "timestamp": e.timestamp.isoformat()
                }
                for e in recent_events
            ],
            "top_event_types": [
                {"event_type": et, "count": count}
                for et, count in top_events
            ],
            "top_sites": [
                {"site_id": site, "count": count}
                for site, count in top_sites
            ]
        }
    except Exception as e:
        return {
            "service": "GhostTrack Analytics",
            "status": "error",
            "error": str(e),
            "summary": {
                "total_events": 0,
                "unique_visitors": 0,
                "events_today": 0
            }
        }


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    📊 GhostTrack Statistics - REAL DATA
    """
    try:
        # Bot vs Human traffic
        total = db.query(func.count(Event.id)).scalar() or 0
        bots = db.query(func.count(Event.id)).filter(Event.is_bot == 1).scalar() or 0
        humans = total - bots

        # Threats detected
        threats = db.query(func.count(Event.id)).filter(Event.threat_score > 50).scalar() or 0

        # Blocked requests
        blocked = db.query(func.count(Event.id)).filter(Event.blocked == 1).scalar() or 0

        return {
            "service": "GhostTrack Stats",
            "status": "operational",
            "traffic": {
                "total_requests": total,
                "human_traffic": humans,
                "bot_traffic": bots,
                "bot_percentage": round((bots / total * 100) if total > 0 else 0, 2)
            },
            "security": {
                "threats_detected": threats,
                "requests_blocked": blocked,
                "threat_percentage": round((threats / total * 100) if total > 0 else 0, 2)
            }
        }
    except Exception as e:
        return {
            "service": "GhostTrack Stats",
            "status": "error",
            "error": str(e)
        }