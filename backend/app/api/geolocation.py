from fastapi import APIRouter, HTTPException
import requests
from functools import lru_cache

router = APIRouter()

@lru_cache(maxsize=1000)
def get_ip_location(ip: str) -> dict:
    """
    Get geolocation data for an IP address using ip-api.com
    Cached to avoid repeated lookups for the same IP
    """
    if not ip or ip == "unknown":
        return {
            "city": "Unknown",
            "region": "Unknown",
            "country": "Unknown",
            "countryCode": "",
            "proxy": False
        }

    try:
        response = requests.get(
            f"http://ip-api.com/json/{ip}?fields=city,region,country,countryCode,proxy",
            timeout=3
        )

        if response.status_code == 200:
            data = response.json()
            # Handle empty response
            if not data or data.get("status") == "fail":
                return {
                    "city": "Unknown",
                    "region": "Unknown",
                    "country": "Unknown",
                    "countryCode": "",
                    "proxy": False
                }
            return {
                "city": data.get("city", "Unknown"),
                "region": data.get("region", "Unknown"),
                "country": data.get("country", "Unknown"),
                "countryCode": data.get("countryCode", ""),
                "proxy": data.get("proxy", False)
            }
        else:
            print(f"⚠️  Geolocation API error for {ip}: HTTP {response.status_code}")
            return {
                "city": "Unknown",
                "region": "Unknown",
                "country": "Unknown",
                "countryCode": "",
                "proxy": False
            }

    except Exception as e:
        print(f"❌ Geolocation error for {ip}: {str(e)}")
        return {
            "city": "Unknown",
            "region": "Unknown",
            "country": "Unknown",
            "countryCode": "",
            "proxy": False
        }


@router.get("/lookup/{ip}")
async def lookup_ip(ip: str):
    """
    Proxy endpoint for IP geolocation lookups
    Returns city, region, country, countryCode, and VPN/proxy detection
    """
    data = get_ip_location(ip)
    return data
