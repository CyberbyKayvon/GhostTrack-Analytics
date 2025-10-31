from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import sqlite3
from typing import Optional

router = APIRouter()


def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


# Request models
class HeatmapClick(BaseModel):
    site_id: str  # ← CORRECT
    session_id: str
    page_url: str
    x: int
    y: int
    viewport_width: int
    viewport_height: int


@router.post("/track")
async def track_click(data: HeatmapClick):
    """Store click heatmap data"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO heatmap_clicks 
            (site_id, session_id, page_url, x_position, y_position, viewport_width, viewport_height)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.site_id,
            data.session_id,
            data.page_url,
            data.x,
            data.y,
            data.viewport_width,
            data.viewport_height
        ))

        conn.commit()
        conn.close()

        return {'status': 'success'}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/data/{site_id}")
async def get_heatmap_data(site_id: str, page_url: Optional[str] = '', days: int = 7):
    """Retrieve heatmap click data"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        if page_url:
            cursor.execute('''
                SELECT x_position, y_position
                FROM heatmap_clicks
                WHERE site_id = ? AND page_url = ?
                AND timestamp >= datetime('now', '-' || ? || ' days')
            ''', (site_id, page_url, days))
        else:
            cursor.execute('''
                SELECT x_position, y_position
                FROM heatmap_clicks
                WHERE site_id = ?
                AND timestamp >= datetime('now', '-' || ? || ' days')
            ''', (site_id, days))

        clicks = cursor.fetchall()

        heatmap_data = [{'x': click[0], 'y': click[1], 'value': 1} for click in clicks]

        conn.close()

        return {
            'clicks': heatmap_data,
            'total_clicks': len(clicks),
            'date_range': days
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))