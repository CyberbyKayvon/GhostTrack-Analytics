from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.database import get_db
from app.models.heatmap import HeatmapClick

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# Request models
class HeatmapClickCreate(BaseModel):
    site_id: str
    session_id: str
    page_url: str
    x: int
    y: int
    viewport_width: int
    viewport_height: int


@router.post("/track")
@limiter.limit("100/minute")  # Limit to 100 requests per minute per IP
async def track_click(request: Request, data: HeatmapClickCreate, db: Session = Depends(get_db)):
    """Store click heatmap data - rate limited to prevent abuse"""
    try:
        new_click = HeatmapClick(
            site_id=data.site_id,
            session_id=data.session_id,
            page_url=data.page_url,
            x_position=data.x,
            y_position=data.y,
            viewport_width=data.viewport_width,
            viewport_height=data.viewport_height,
            timestamp=datetime.utcnow()
        )

        db.add(new_click)
        db.commit()
        db.refresh(new_click)

        return {'status': 'success', 'click_id': new_click.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/data/{site_id}")
async def get_heatmap_data(
    site_id: str,
    page_url: Optional[str] = None,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Retrieve heatmap click data"""
    try:
        # Calculate date threshold
        date_threshold = datetime.utcnow() - timedelta(days=days)

        # Build query
        query = db.query(HeatmapClick).filter(
            HeatmapClick.site_id == site_id,
            HeatmapClick.timestamp >= date_threshold
        )

        # Add page filter if provided
        if page_url:
            query = query.filter(HeatmapClick.page_url == page_url)

        # Execute query
        clicks = query.all()

        # Format response
        heatmap_data = [
            {
                'x': click.x_position,
                'y': click.y_position,
                'value': 1
            }
            for click in clicks
        ]

        return {
            'clicks': heatmap_data,
            'total_clicks': len(clicks),
            'date_range': days
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
