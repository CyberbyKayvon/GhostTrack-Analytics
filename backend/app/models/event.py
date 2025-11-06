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

    # Link tracking fields (for click events on links, PDFs, external sites)
    link_url = Column(String, nullable=True)  # Destination URL of clicked link
    link_text = Column(String, nullable=True)  # Text content of clicked link
    is_pdf = Column(Integer, default=0)  # 1 if link points to PDF file
    opens_new_tab = Column(Integer, default=0)  # 1 if link has target="_blank"
    is_external = Column(Integer, default=0)  # 1 if link goes to different domain

    # Geographic data (commented out until migration runs)
    #city = Column(String, nullable=True)
    #region = Column(String, nullable=True)
    #country = Column(String, nullable=True)
    #country_code = Column(String, nullable=True)

    # VPN/Proxy detection (commented out until migration runs)
    #is_vpn = Column(Integer, default=0)  # 0 or 1

    def __repr__(self):
        return f"<Event {self.id} - {self.event_type} - {self.site_id}>"