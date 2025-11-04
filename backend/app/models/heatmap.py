from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime


class HeatmapClick(Base):
    __tablename__ = "heatmap_clicks"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(String, index=True, nullable=False)
    session_id = Column(String, index=True, nullable=False)
    page_url = Column(String, index=True, nullable=False)
    x_position = Column(Integer, nullable=False)
    y_position = Column(Integer, nullable=False)
    viewport_width = Column(Integer, nullable=False)
    viewport_height = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<HeatmapClick {self.id} - {self.site_id} - ({self.x_position}, {self.y_position})>"
