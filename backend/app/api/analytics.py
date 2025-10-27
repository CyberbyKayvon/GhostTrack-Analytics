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

    # Unique visitors (distinct visitor IDs - PERSISTENT)
    unique_visitors = db.query(func.count(distinct(Event.visitor_id))).filter(
        Event.site_id == site_id,
        Event.visitor_id != 'unknown'
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
                "visitor_id": event.visitor_id,
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


@router.get("/recent-visitors")
async def get_recent_visitors(
        site_id: str = "ghosttrack-test-dashboard",
        limit: int = 10,
        db: Session = Depends(get_db)
):
    """
    Get recent UNIQUE users with PERSISTENT visitor IDs
    Each visitor appears ONCE, even if they had multiple sessions
    Shows their TOTAL activity across all time
    """
    recent_time = datetime.utcnow() - timedelta(hours=24)

    # Get ALL visitors for this site to assign persistent numbers
    all_visitors = db.query(
        Event.visitor_id,
        func.min(Event.timestamp).label('first_seen_ever')
    ).filter(
        Event.site_id == site_id,
        Event.visitor_id != 'unknown',
        Event.visitor_id.isnot(None)
    ).group_by(
        Event.visitor_id
    ).order_by(
        'first_seen_ever'  # Oldest visitor gets #001
    ).all()

    # Create visitor ID to number mapping (PERSISTENT)
    visitor_number_map = {}
    for idx, visitor_record in enumerate(all_visitors):
        visitor_number = idx + 1
        visitor_number_map[visitor_record.visitor_id] = str(visitor_number).zfill(3)

    # Get recent unique visitors (last 24 hours) - ONE ROW PER VISITOR
    visitor_data = db.query(
        Event.visitor_id,
        func.max(Event.timestamp).label('last_seen'),
        func.min(Event.timestamp).label('first_seen_ever'),
        func.count(Event.id).label('total_actions')
    ).filter(
        Event.site_id == site_id,
        Event.timestamp >= recent_time,
        Event.visitor_id != 'unknown',
        Event.visitor_id.isnot(None)
    ).group_by(
        Event.visitor_id  # ONLY group by visitor_id for true uniqueness
    ).order_by(
        desc('last_seen')  # Most recent activity first
    ).limit(limit).all()

    visitors = []

    for visitor in visitor_data:
        # Get persistent visitor number
        visitor_number_padded = visitor_number_map.get(visitor.visitor_id, '???')

        # Get most recent event for this visitor to get IP, browser, last page
        last_event = db.query(Event).filter(
            Event.visitor_id == visitor.visitor_id
        ).order_by(desc(Event.timestamp)).first()

        if not last_event:
            continue

        # Calculate duration for most recent session
        duration_seconds = 0
        if visitor.first_seen_ever and visitor.last_seen:
            duration_seconds = int((visitor.last_seen - visitor.first_seen_ever).total_seconds())

        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        duration_str = f"{minutes}:{seconds:02d}"

        # Detect browser from most recent user agent
        browser = detect_browser(last_event.user_agent)

        visitors.append({
            "id": visitor_number_padded,  # PERSISTENT NUMBER
            "visitor": f"#{visitor_number_padded}",
            "ip": last_event.ip_address or "Unknown",
            "browser": browser,
            "clicks": visitor.total_actions,  # Total actions
            "duration": duration_str,
            "last_page": last_event.url or "Unknown",
            "timestamp": visitor.last_seen.isoformat(),
            "visitor_id": visitor.visitor_id,
            "session_id": last_event.session_id
        })

    return {"visitors": visitors}