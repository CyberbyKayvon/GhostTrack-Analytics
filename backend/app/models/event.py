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
    session_id = Column(String, index=True, nullable=True)
    is_bot = Column(Integer, default=0)  # 0 or 1
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # ✅ NEW: Geographic data
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)
    country = Column(String, nullable=True)
    country_code = Column(String, nullable=True)

    # ✅ NEW: Device and browser detection
    device_type = Column(String, nullable=True)  # mobile, desktop, tablet
    browser = Column(String, nullable=True)  # Chrome, Safari, Firefox, etc.

    # ✅ NEW: Referrer source categorization
    referrer_source = Column(String, nullable=True)  # direct, organic, social, referral

    def __repr__(self):
        return f"<Event {self.id} - {self.event_type} - {self.site_id}>"