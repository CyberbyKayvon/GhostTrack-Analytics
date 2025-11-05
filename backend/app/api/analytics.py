from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, desc, asc
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

    # Unique visitors (distinct session IDs where session_id != 'unknown')
    unique_visitors = db.query(func.count(distinct(Event.session_id))).filter(
        Event.site_id == site_id,
        Event.session_id != 'unknown'
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
    Get recent events for a site - WITH FULL CONTEXT
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
                "user_agent": event.user_agent,
                # ✅ NEW: Include IP and referrer
                "ip_address": event.ip_address or "N/A",
                "referrer": event.referrer or "Direct"
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
    Get recent unique visitors with their activity - PROFESSIONAL GRADE ACCURACY

    This implementation follows industry standards used by Google Analytics, Mixpanel, etc.

    Key features:
    - Deterministic visitor numbering based on first_seen timestamp
    - Session-based tracking (not IP-based, as IPs can be shared)
    - Accurate activity counting (all events per session)
    - Consistent ordering (newest activity first)
    """
    recent_time = datetime.utcnow() - timedelta(hours=24)

    # STEP 1: Get all unique sessions with their first and last activity
    # Group ONLY by session_id to prevent duplicates when user switches devices/browsers
    # We'll get the most recent IP and user_agent for each session
    visitor_sessions = db.query(
        Event.session_id,
        func.max(Event.timestamp).label('last_seen'),
        func.min(Event.timestamp).label('first_seen')
    ).filter(
        Event.site_id == site_id,
        Event.timestamp >= recent_time,
        Event.session_id != 'unknown'
    ).group_by(
        Event.session_id
    ).order_by(
        desc('last_seen')  # Most recent activity first
    ).limit(limit).all()

    if not visitor_sessions:
        return {"visitors": []}

    # STEP 1.5: For each session, get the most recent event to extract IP and user_agent
    visitor_data = []
    for session in visitor_sessions:
        # Get the most recent event for this session
        latest_event = db.query(Event).filter(
            Event.session_id == session.session_id
        ).order_by(desc(Event.timestamp)).first()

        if latest_event:
            visitor_data.append({
                'session_id': session.session_id,
                'ip_address': latest_event.ip_address,
                'user_agent': latest_event.user_agent,
                'last_seen': session.last_seen,
                'first_seen': session.first_seen,
                'is_bot': latest_event.is_bot
            })

    if not visitor_data:
        return {"visitors": []}

    # STEP 2: Get ALL sessions for this site to determine proper visitor numbering
    # Visitor #001 = earliest first_seen timestamp across ALL sessions
    all_sessions = db.query(
        Event.session_id,
        func.min(Event.timestamp).label('first_seen')
    ).filter(
        Event.site_id == site_id,
        Event.session_id != 'unknown'
    ).group_by(
        Event.session_id
    ).order_by(
        asc('first_seen')  # Earliest session gets #001
    ).all()

    # Create mapping: session_id -> visitor_number
    session_to_number = {}
    for idx, session in enumerate(all_sessions, start=1):
        session_to_number[session.session_id] = str(idx).zfill(3)  # 001, 002, 003...

    # STEP 3: Build visitor objects with accurate data
    visitors = []

    for visitor in visitor_data:
        # Get visitor number from mapping (based on first_seen across ALL sessions)
        visitor_number = session_to_number.get(visitor['session_id'], '999')

        # Count ALL events for this session (not just clicks)
        activity_count = db.query(func.count(Event.id)).filter(
            Event.session_id == visitor['session_id']
        ).scalar() or 0

        # Calculate session duration
        duration_seconds = 0
        if visitor['first_seen'] and visitor['last_seen']:
            duration_seconds = int((visitor['last_seen'] - visitor['first_seen']).total_seconds())

        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        duration_str = f"{minutes}:{seconds:02d}"

        # Get last page visited
        last_event = db.query(Event).filter(
            Event.session_id == visitor['session_id']
        ).order_by(desc(Event.timestamp)).first()

        last_page = "Unknown"
        if last_event and last_event.url:
            last_page = last_event.url

        # Detect browser
        browser = detect_browser(visitor['user_agent'])

        visitors.append({
            "id": visitor_number,
            "visitor": f"#{visitor_number}",
            "ip": visitor['ip_address'] or "Unknown",
            "browser": browser,
            "clicks": activity_count,  # All events count as activity
            "duration": duration_str,
            "last_page": last_page,
            "timestamp": visitor['last_seen'].isoformat(),
            "session_id": visitor['session_id'],
            "user_agent": visitor['user_agent'] or "",  # Include user_agent for frontend parsing
            "is_bot": visitor['is_bot']  # Include bot status
        })

    return {"visitors": visitors}