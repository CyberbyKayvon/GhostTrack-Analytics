from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, desc
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.event import Event
import requests

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


def get_location_from_ip(ip_address):
    """Get location information from IP address"""
    if not ip_address or ip_address == "Unknown":
        return "Unknown"

    # Check for localhost/private IPs
    if ip_address in ['127.0.0.1', 'localhost', '::1'] or ip_address.startswith('192.168.') or ip_address.startswith(
            '10.'):
        return "Local"

    try:
        # Use free ipapi.co service (1000 requests/day free)
        # No API key needed for basic usage
        response = requests.get(f'https://ipapi.co/{ip_address}/json/', timeout=2)

        if response.status_code == 200:
            data = response.json()

            # Build location string
            city = data.get('city', '')
            region = data.get('region', '')
            country = data.get('country_name', '')

            # Format: City, Region or City, Country or just Country
            if city and region:
                return f"{city}, {region}"
            elif city and country:
                return f"{city}, {country}"
            elif country:
                return country
            else:
                return "Unknown"
        else:
            return "Unknown"
    except Exception as e:
        print(f"Error fetching location for IP {ip_address}: {e}")
        return "Unknown"


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

    # Bot detections - Count bot events
    bot_detections = db.query(func.count(Event.id)).filter(
        Event.site_id == site_id,
        Event.is_bot == True
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


@router.get("/recent-visitors")
async def get_recent_visitors(
        site_id: str = "ghosttrack-test-dashboard",
        limit: int = 10,
        db: Session = Depends(get_db)
):
    """
    Get recent unique visitors with their activity
    Returns visitors with sequential numbering (001-010)
    Newest visitors get highest numbers
    Includes location information based on IP address
    """
    recent_time = datetime.utcnow() - timedelta(hours=24)

    # Get visitor data ordered by most recent first
    visitor_data = db.query(
        Event.session_id,
        Event.ip_address,
        Event.user_agent,
        func.max(Event.timestamp).label('last_seen'),
        func.min(Event.timestamp).label('first_seen')
    ).filter(
        Event.site_id == site_id,
        Event.timestamp >= recent_time
    ).group_by(
        Event.session_id,
        Event.ip_address,
        Event.user_agent
    ).order_by(
        desc('last_seen')  # Most recent first
    ).limit(limit).all()

    visitors = []
    total_visitors = len(visitor_data)

    # Assign sequential numbers with newest visitor getting highest number
    for idx, visitor in enumerate(visitor_data):
        # Calculate visitor number: newest visitor gets limit, oldest gets 1
        visitor_number = total_visitors - idx
        visitor_number_padded = str(visitor_number).zfill(3)  # Format as 001, 002, 003...

        # Count ALL events for this session (activity count)
        activity_count = db.query(func.count(Event.id)).filter(
            Event.session_id == visitor.session_id
        ).scalar() or 0

        duration_seconds = 0
        if visitor.first_seen and visitor.last_seen:
            duration_seconds = int((visitor.last_seen - visitor.first_seen).total_seconds())

        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        duration_str = f"{minutes}:{seconds:02d}"

        last_event = db.query(Event).filter(
            Event.session_id == visitor.session_id
        ).order_by(desc(Event.timestamp)).first()

        last_page = "Unknown"
        if last_event and last_event.url:
            last_page = last_event.url.split('/')[-1] or "Home Page"

        # Detect browser
        browser = detect_browser(visitor.user_agent)

        # Get location from IP
        location = get_location_from_ip(visitor.ip_address)

        visitors.append({
            "id": visitor_number_padded,
            "visitor": f"#{visitor_number_padded}",
            "ip": visitor.ip_address or "Unknown",
            "browser": browser,
            "location": location,
            "clicks": activity_count,
            "duration": duration_str,
            "last_page": last_page,
            "timestamp": visitor.last_seen.isoformat(),
            "session_id": visitor.session_id
        })

    return {"visitors": visitors}