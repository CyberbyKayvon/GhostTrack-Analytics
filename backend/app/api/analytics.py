from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, desc
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.event import Event

router = APIRouter()


def detect_browser(user_agent):
    """Detect browser from user agent string"""
    if not user_agent:
        return "Unknown"

    ua = user_agent.lower()

    # Check in order of specificity
    if 'edg/' in ua or 'edge' in ua:
        return "Edge"
    elif 'chrome' in ua and 'safari' in ua:
        return "Chrome"
    elif 'firefox' in ua:
        return "Firefox"
    elif 'safari' in ua and 'chrome' not in ua:
        return "Safari"
    elif 'opera' in ua or 'opr/' in ua:
        return "Opera"
    elif 'brave' in ua:
        return "Brave"
    elif 'msie' in ua or 'trident' in ua:
        return "IE"
    else:
        return "Other"


@router.get("/stats")
async def get_stats(
        site_id: str = "ghosttrack-test-dashboard",
        db: Session = Depends(get_db)
):
    """
    Get overall analytics statistics
    """
    # Total events
    total_events = db.query(func.count(Event.id)).filter(
        Event.site_id == site_id
    ).scalar() or 0

    # Unique visitors (distinct session IDs)
    unique_visitors = db.query(func.count(distinct(Event.session_id))).filter(
        Event.site_id == site_id
    ).scalar() or 0

    # Page views (pageview events)
    page_views = db.query(func.count(Event.id)).filter(
        Event.site_id == site_id,
        Event.event_type == "pageview"
    ).scalar() or 0

    # Bot detections
    bot_detections = db.query(func.count(Event.id)).filter(
        Event.site_id == site_id,
        Event.is_bot == 1
    ).scalar() or 0

    # Suspicious activity events
    suspicious_activity = db.query(func.count(Event.id)).filter(
        Event.site_id == site_id,
        Event.event_type == "suspicious_activity"
    ).scalar() or 0

    return {
        "total_events": total_events,
        "unique_visitors": unique_visitors,
        "page_views": page_views,
        "bot_detections": bot_detections,
        "suspicious_activity": suspicious_activity
    }


@router.get("/events")
async def get_events(
        site_id: str = "ghosttrack-test-dashboard",
        limit: int = 50,
        db: Session = Depends(get_db)
):
    """
    Get recent events for a site
    """
    events = db.query(Event).filter(
        Event.site_id == site_id
    ).order_by(desc(Event.timestamp)).limit(limit).all()

    return {
        "events": [
            {
                "id": event.id,
                "event_type": event.event_type,
                "url": event.url,
                "timestamp": event.timestamp.isoformat(),
                "session_id": event.session_id,
                "is_bot": event.is_bot,
                "user_agent": event.user_agent
            }
            for event in events
        ]
    }


@router.get("/traffic-sources")
async def get_traffic_sources(
        site_id: str = "ghosttrack-test-dashboard",
        db: Session = Depends(get_db)
):
    """
    Get traffic sources breakdown
    """
    events = db.query(Event.referrer).filter(
        Event.site_id == site_id,
        Event.referrer.isnot(None)
    ).all()

    sources = {
        "direct": 0,
        "organic": 0,
        "social": 0,
        "referral": 0
    }

    for event in events:
        referrer = (event.referrer or "").lower()

        if not referrer or referrer == "direct":
            sources["direct"] += 1
        elif "google" in referrer or "bing" in referrer or "yahoo" in referrer:
            sources["organic"] += 1
        elif "facebook" in referrer or "twitter" in referrer or "instagram" in referrer or "linkedin" in referrer:
            sources["social"] += 1
        else:
            sources["referral"] += 1

    direct_count = db.query(func.count(Event.id)).filter(
        Event.site_id == site_id,
        Event.referrer.is_(None)
    ).scalar() or 0

    sources["direct"] += direct_count

    return {
        "sources": [
            {"name": "Direct", "value": sources["direct"], "color": "#667eea"},
            {"name": "Organic Search", "value": sources["organic"], "color": "#48bb78"},
            {"name": "Social Media", "value": sources["social"], "color": "#ed8936"},
            {"name": "Referral", "value": sources["referral"], "color": "#4299e1"}
        ]
    }


