from fastapi import APIRouter, Depends, HTTPException, Request, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import hashlib
import requests
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


def get_geolocation(ip_address: str) -> dict:
    """
    Get geolocation data from IP address using ip-api.com (free, no key required)
    Returns dict with city, region, country, country_code, and proxy detection
    """
    if not ip_address or ip_address == "unknown":
        return {"city": None, "region": None, "country": None, "country_code": None, "proxy": False}

    try:
        # ip-api.com provides free geolocation with VPN/proxy detection
        # Fields: city,region,country,countryCode,proxy (proxy=true if VPN/datacenter)
        response = requests.get(
            f"http://ip-api.com/json/{ip_address}?fields=city,region,country,countryCode,proxy",
            timeout=2  # 2 second timeout to avoid blocking
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "city": data.get("city"),
                "region": data.get("region"),
                "country": data.get("country"),
                "country_code": data.get("countryCode"),
                "proxy": data.get("proxy", False)
            }
    except Exception as e:
        print(f"⚠️  Geolocation lookup failed for {ip_address}: {str(e)}")

    return {"city": None, "region": None, "country": None, "country_code": None, "proxy": False}


def detect_vpn(ip_address: str) -> bool:
    """
    Detect if IP is from a VPN/Proxy/Hosting provider
    Uses common VPN/hosting IP ranges and patterns
    """
    if not ip_address or ip_address == "unknown":
        return False

    # Known VPN/Hosting/Datacenter IP ranges (first octet patterns)
    # These are commonly used by VPNs, cloud hosting, and data centers
    vpn_ranges = [
        # Major VPN providers often use these ranges
        (104, 116),  # AWS, Google Cloud, Azure ranges
        (13, 13),    # Amazon AWS
        (34, 35),    # Google Cloud
        (20, 20),    # Microsoft Azure
        (52, 52),    # AWS
        (54, 54),    # AWS
        (3, 3),      # AWS
        (18, 18),    # AWS
        (23, 23),    # Akamai/CDN
        (31, 31),    # Various datacenters
        (37, 37),    # Various datacenters
        (46, 46),    # Various datacenters
        (62, 62),    # Various datacenters
        (63, 63),    # Level 3/CenturyLink
        (66, 66),    # Various datacenters
        (67, 67),    # Various datacenters
        (78, 78),    # European datacenters
        (79, 79),    # European datacenters
        (80, 80),    # European datacenters
        (81, 81),    # European datacenters
        (82, 82),    # European datacenters
        (83, 83),    # European datacenters
        (84, 84),    # European datacenters
        (85, 85),    # European datacenters
        (86, 86),    # European datacenters
        (87, 87),    # European datacenters
        (88, 88),    # European datacenters
        (89, 89),    # European datacenters
        (90, 90),    # European datacenters
        (91, 91),    # European datacenters
        (92, 92),    # European datacenters
        (93, 93),    # European datacenters
        (94, 94),    # European datacenters
        (95, 95),    # European datacenters
        (138, 139),  # Datacenters
        (159, 159),  # DigitalOcean
        (161, 161),  # DigitalOcean
        (162, 162),  # DigitalOcean
        (164, 167),  # Datacenters
        (185, 185),  # European hosting
        (188, 188),  # European hosting
        (192, 192),  # Private/hosting (192.x is often private but 192.0.x.x is public hosting)
    ]

    try:
        first_octet = int(ip_address.split('.')[0])

        # Check if IP falls within known VPN/datacenter ranges
        for range_start, range_end in vpn_ranges:
            if range_start <= first_octet <= range_end:
                return True

    except (ValueError, IndexError):
        pass

    return False


def enhanced_bot_detection(user_agent: str, event_data: dict) -> bool:
    """
    Enhanced bot detection with multiple signals
    Returns True if detected as bot
    """
    if not user_agent:
        return True  # No user agent = likely bot

    ua_lower = user_agent.lower()

    # Common bot indicators in user agent
    bot_patterns = [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
        'java', 'http', 'php', 'ruby', 'perl', 'go-http', 'node',
        'axios', 'fetch', 'postman', 'insomnia', 'httpclient',
        'selenium', 'puppeteer', 'playwright', 'headless', 'phantom',
        'chrome-lighthouse', 'pagespeed', 'gtmetrix', 'pingdom',
        'uptimerobot', 'monitor', 'check', 'test', 'benchmark',
        'slurp', 'duckduckbot', 'bingbot', 'googlebot', 'baiduspider',
        'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
        'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'rogerbot',
        'linkedin', 'twitterbot', 'facebookexternalhit', 'whatsapp',
        'telegram', 'discord', 'slack'
    ]

    for pattern in bot_patterns:
        if pattern in ua_lower:
            return True

    # Check for automation tool signatures
    automation_signals = event_data.get('automation_signals', {})
    if automation_signals:
        # WebDriver detection
        if automation_signals.get('webdriver'):
            return True
        # Chrome headless detection
        if automation_signals.get('headless'):
            return True
        # Automation flag
        if automation_signals.get('automated'):
            return True

    # Check for suspicious screen resolutions
    screen_width = event_data.get('screen_width')
    screen_height = event_data.get('screen_height')
    if screen_width and screen_height:
        # Very small or very large resolutions are suspicious
        if screen_width < 200 or screen_height < 200:
            return True
        if screen_width > 10000 or screen_height > 10000:
            return True

    # NOTE: Removed has_plugins check - mobile browsers legitimately don't have plugins
    # This was causing false positives for real mobile users

    return False


@router.post("/track")
@limiter.limit("100/minute")  # Limit to 100 requests per minute per IP
async def track_event(request: Request, event_data: dict = Body(...), db: Session = Depends(get_db)):
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

        # 🔍 Enhanced bot detection
        is_bot_detected = enhanced_bot_detection(user_agent, event_data) or is_bot
        is_bot_int = 1 if is_bot_detected else 0

        if is_bot_detected:
            print(f"🤖 BOT DETECTED: {user_agent[:50]}")

        # Extract link tracking data (for click events)
        link_url = event_data.get("link_url")
        link_text = event_data.get("link_text")
        is_pdf = 1 if event_data.get("is_pdf") else 0
        opens_new_tab = 1 if event_data.get("opens_new_tab") else 0
        is_external = 1 if event_data.get("is_external") else 0

        # 🌍 Get geolocation data (includes VPN/proxy detection)
        geo_data = get_geolocation(ip_address)
        is_vpn_int = 1 if geo_data.get("proxy", False) else 0

        if is_vpn_int:
            print(f"🔒 VPN/PROXY DETECTED: {ip_address} -> {geo_data.get('country', 'Unknown')}")

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
            timestamp=datetime.utcnow(),
            # Link tracking fields
            link_url=link_url,
            link_text=link_text,
            is_pdf=is_pdf,
            opens_new_tab=opens_new_tab,
            is_external=is_external,
            # Geographic data
            city=geo_data.get("city"),
            region=geo_data.get("region"),
            country=geo_data.get("country"),
            country_code=geo_data.get("country_code"),
            # VPN detection
            is_vpn=is_vpn_int
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