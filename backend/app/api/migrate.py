"""
Database migration endpoint
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()


@router.post("/add-link-tracking-columns")
async def add_link_tracking_columns(db: Session = Depends(get_db)):
    """
    Migration endpoint to add link tracking columns to events table
    This is a one-time migration endpoint
    """
    try:
        # Check if columns already exist
        result = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'events' AND column_name = 'link_url'
        """))

        if result.fetchone():
            return {
                "status": "success",
                "message": "Columns already exist, no migration needed",
                "columns_added": False
            }

        # Add link tracking columns
        db.execute(text("""
            ALTER TABLE events
            ADD COLUMN IF NOT EXISTS link_url VARCHAR,
            ADD COLUMN IF NOT EXISTS link_text VARCHAR,
            ADD COLUMN IF NOT EXISTS is_pdf INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS opens_new_tab INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS is_external INTEGER DEFAULT 0
        """))

        db.commit()

        return {
            "status": "success",
            "message": "Migration completed successfully",
            "columns_added": True,
            "columns": [
                "link_url (VARCHAR)",
                "link_text (VARCHAR)",
                "is_pdf (INTEGER)",
                "opens_new_tab (INTEGER)",
                "is_external (INTEGER)"
            ]
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
