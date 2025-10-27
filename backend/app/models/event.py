from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.core.database import Base
from datetime import datetime


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(String, index=True)
    event_type = Column(String, index=True)
    url = Column(String)
    referrer = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    visitor_id = Column(String, index=True, nullable=True)  # NEW: Persistent visitor ID
    session_id = Column(String, index=True, nullable=True)  # Per-session ID
    is_bot = Column(Integer, default=0)  # 0 or 1
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<Event {self.id} - {self.event_type} - {self.site_id}>"