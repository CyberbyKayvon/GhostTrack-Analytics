from sqlalchemy import Column, Integer, String, DateTime, JSON, Float, Text
from datetime import datetime
from app.core.database import Base  # Import Base from database.py


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(String(255), index=True, nullable=False)
    event_type = Column(String(100), index=True, nullable=False)
    url = Column(Text, nullable=False)
    referrer = Column(Text, nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(255), index=True, nullable=True)
    ip_address = Column(String(50), nullable=True)
    event_metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Security fields (we'll use these later for bot detection)
    is_bot = Column(Integer, default=0)
    threat_score = Column(Float, default=0.0)
    blocked = Column(Integer, default=0)

    def __repr__(self):
        return f""