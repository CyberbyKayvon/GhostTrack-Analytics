from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.event import Event
from sqlalchemy import func, distinct

router = APIRouter()


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

    # Bot detections - Check both is_bot flag and suspicious_activity event type
    bot_detections = db.query(func.count(Event.id)).filter(
        Event.site_id == site_id
    ).filter(
        (Event.is_bot == True) | (Event.event_type == "suspicious_activity")
    ).scalar() or 0

    return {
        "total_events": total_events,
        "unique_visitors": unique_visitors,
        "page_views": page_views,
        "bot_detections": bot_detections
    }


@router.get("/events")
async def get_events(
        site_id: str = "ghosttrack-test-dashboard",
        limit: int = 50,
        db: Session = Depends(get_db)
):
    """
    Get recent events
    """
    events = db.query(Event).filter(
        Event.site_id == site_id
    ).order_by(Event.timestamp.desc()).limit(limit).all()

    return {
        "events": [
            {
                "id": event.id,
                "event_type": event.event_type,
                "url": event.url,
                "timestamp": event.timestamp.isoformat(),
                "session_id": event.session_id,
                "is_bot": event.is_bot
            }
            for event in events
        ]
    }


@router.get("/events/by-type")
async def get_events_by_type(
        site_id: str = "ghosttrack-test-dashboard",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    Get events grouped by type
    """
    query = db.query(
        Event.event_type,
        func.count(Event.id).label('count')
    ).filter(Event.site_id == site_id)

    if start_date:
        query = query.filter(Event.timestamp >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Event.timestamp <= datetime.fromisoformat(end_date))

    results = query.group_by(Event.event_type).all()

    return {
        "event_types": [
            {"type": result.event_type, "count": result.count}
            for result in results
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
    # Get all events with referrers
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

    # Categorize traffic sources
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

    # Count direct visits (no referrer)
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


@router.get("/recent-visitors")
async def get_recent_visitors(
        site_id: str = "ghosttrack-test-dashboard",
        limit: int = 10,
        db: Session = Depends(get_db)
):
    """
    Get recent unique visitors with their activity
    """
    from sqlalchemy import desc, func
    from datetime import datetime, timedelta

    # Get recent sessions (last 24 hours)
    recent_time = datetime.utcnow() - timedelta(hours=24)

    # Query for unique sessions with aggregated data
    visitor_data = db.query(
        Event.session_id,
        Event.ip_address,
        func.count(Event.id).label('page_count'),
        func.max(Event.timestamp).label('last_seen'),
        func.min(Event.timestamp).label('first_seen')
    ).filter(
        Event.site_id == site_id,
        Event.timestamp >= recent_time
    ).group_by(
        Event.session_id,
        Event.ip_address
    ).order_by(
        desc('last_seen')
    ).limit(limit).all()

    visitors = []
    for idx, visitor in enumerate(visitor_data, 1):
        # Calculate duration
        duration_seconds = 0
        if visitor.first_seen and visitor.last_seen:
            duration_seconds = int((visitor.last_seen - visitor.first_seen).total_seconds())

        # Format duration
        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        duration_str = f"{minutes}:{seconds:02d}"

        # Get last page visited
        last_event = db.query(Event).filter(
            Event.session_id == visitor.session_id
        ).order_by(desc(Event.timestamp)).first()

        last_page = "Unknown"
        if last_event and last_event.url:
            last_page = last_event.url.split('/')[-1] or "Home Page"

        # Calculate time ago
        time_diff = datetime.utcnow() - visitor.last_seen
        if time_diff.total_seconds() < 60:
            time_ago = "Just now"
        elif time_diff.total_seconds() < 3600:
            mins = int(time_diff.total_seconds() / 60)
            time_ago = f"{mins} min ago"
        else:
            hours = int(time_diff.total_seconds() / 3600)
            time_ago = f"{hours}h ago"

        visitors.append({
            "id": idx,
            "visitor": f"Visitor #{visitor.session_id[:8]}",
            "ip": visitor.ip_address or "Unknown",
            "pages": visitor.page_count,
            "duration": duration_str,
            "last_page": last_page,
            "time_ago": time_ago,
            "timestamp": visitor.last_seen.isoformat()
        })

    return {"visitors": visitors}

