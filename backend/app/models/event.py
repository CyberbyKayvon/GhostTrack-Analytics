from sqlalchemy import Column, Integer, String, DateTime, JSON, Float, Text
from app.core.database import Base
from datetime import datetime


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
    metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Security fields
    is_bot = Column(Integer, default=0)  # 0 = human, 1 = bot
    threat_score = Column(Float, default=0.0)  # 0-100
    blocked = Column(Integer, default=0)  # 0 = allowed, 1 = blocked

    def __repr__(self):
        return f"<Event {self.id}: {self.event_type} from {self.site_id}>"