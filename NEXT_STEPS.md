# GhostTrack - Next Steps Guide

## ✅ What's Working Now:
- Backend API running on localhost:8000
- Event tracking endpoint ready
- API documentation at /docs
- JavaScript tracker created

## 🎯 Phase 2: Add Database (Your Next Session)

### Step 1: Install Alembic
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install alembic
pip freeze > requirements.txt
```

### Step 2: Create Database Models

**File: `backend/app/models/event.py`**
```python
from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(String, index=True)
    event_type = Column(String, index=True)
    url = Column(String)
    referrer = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    session_id = Column(String, index=True, nullable=True)
    ip_address = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_bot = Column(Integer, default=0)
    threat_score = Column(Float, default=0.0)
```

### Step 3: Update database.py

**File: `backend/app/core/database.py`**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.event import Base

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 4: Update events.py to Save Data

**File: `backend/app/api/events.py`**
```python
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.database import get_db
from app.models.event import Event

router = APIRouter()

class EventData(BaseModel):
    site_id: str
    event_type: str
    url: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@router.post("/track")
async def track_event(event: EventData, request: Request, db: Session = Depends(get_db)):
    try:
        db_event = Event(
            site_id=event.site_id,
            event_type=event.event_type,
            url=event.url,
            referrer=event.referrer,
            user_agent=event.user_agent,
            session_id=event.session_id,
            ip_address=request.client.host,
            metadata=event.metadata,
            timestamp=datetime.utcnow()
        )
        
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        
        print(f"📊 ✅ Event SAVED to database: ID {db_event.id}")
        
        return {
            "status": "success",
            "event_id": db_event.id,
            "timestamp": db_event.timestamp.isoformat()
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch")
async def track_batch_events(events: list[EventData], request: Request, db: Session = Depends(get_db)):
    try:
        db_events = []
        for event in events:
            db_event = Event(
                site_id=event.site_id,
                event_type=event.event_type,
                url=event.url,
                referrer=event.referrer,
                user_agent=event.user_agent,
                session_id=event.session_id,
                ip_address=request.client.host,
                metadata=event.metadata,
                timestamp=datetime.utcnow()
            )
            db_events.append(db_event)
        
        db.bulk_save_objects(db_events)
        db.commit()
        
        print(f"📊 ✅ Batch SAVED: {len(db_events)} events")
        
        return {"status": "success", "processed": len(db_events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 5: Start Database & Test
```powershell
# Start PostgreSQL
docker-compose up -d postgres

# Restart backend
uvicorn app.main:app --reload

# Test at http://localhost:8000/docs
# Send an event - it should now SAVE to database!
```

### Step 6: Query Your Data

**Add this endpoint to `analytics.py`:**
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.event import Event

router = APIRouter()

@router.get("/")
async def get_analytics(db: Session = Depends(get_db)):
    total_events = db.query(func.count(Event.id)).scalar()
    unique_sessions = db.query(func.count(func.distinct(Event.session_id))).scalar()
    
    recent_events = db.query(Event).order_by(Event.timestamp.desc()).limit(10).all()
    
    return {
        "total_events": total_events,
        "unique_visitors": unique_sessions,
        "recent_events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "site_id": e.site_id,
                "timestamp": e.timestamp.isoformat()
            }
            for e in recent_events
        ]
    }
```

Now when you go to `/api/v1/analytics/` you'll see REAL DATA! 🎉

---

## 🧪 Phase 3: Test with HTML Page

**Create `test.html` in project root:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>GhostTrack Test</title>
    <style>
        body { font-family: Arial; max-width: 900px; margin: 30px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        button { padding: 15px 30px; margin: 10px; font-size: 16px; cursor: pointer; border: none; border-radius: 5px; transition: all 0.3s; }
        .btn-primary { background: #4CAF50; color: white; }
        .btn-primary:hover { background: #45a049; }
        .btn-secondary { background: #2196F3; color: white; }
        .btn-secondary:hover { background: #0b7dda; }
        .btn-warning { background: #ff9800; color: white; }
        .btn-warning:hover { background: #e68900; }
        #output { margin-top: 20px; padding: 20px; background: #e8f5e9; border-radius: 5px; border-left: 4px solid #4CAF50; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .stat-box { background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; color: #2196F3; }
        .stat-label { color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 GhostTrack Testing Dashboard</h1>
        <p><strong>Instructions:</strong> Open browser console (F12) and your backend terminal to see events in real-time!</p>
        
        <div class="stats">
            <div class="stat-box">
                <div class="stat-number" id="eventCount">0</div>
                <div class="stat-label">Events Sent</div>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="successCount">0</div>
                <div class="stat-label">Successful</div>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="errorCount">0</div>
                <div class="stat-label">Errors</div>
            </div>
        </div>
        
        <h2>📊 Test Basic Events:</h2>
        <button class="btn-primary" onclick="testPageview()">📄 Pageview</button>
        <button class="btn-secondary" onclick="testClick()">🖱️ Click Event</button>
        <button class="btn-secondary" onclick="testScroll()">📜 Scroll Event</button>
        
        <h2>🛒 Test E-commerce Events:</h2>
        <button class="btn-warning" onclick="testAddToCart()">🛒 Add to Cart</button>
        <button class="btn-warning" onclick="testCheckout()">💳 Checkout</button>
        <button class="btn-warning" onclick="testPurchase()">✅ Purchase</button>
        
        <h2>🤖 Test Bot Simulation:</h2>
        <button style="background: #f44336; color: white;" onclick="testBotBehavior()">🤖 Simulate Bot</button>
        
        <div id="output">
            <strong>Waiting for events...</strong>
        </div>
    </div>

    <!-- GhostTrack Configuration -->
    <script>
        window.ghostTrackUrl = 'http://localhost:8000/api/v1/events/track';
        window.ghostTrackSiteId = 'test-store-001';
        window.ghostTrackDebug = true;
    </script>
    
    <!-- Load GhostTrack -->
    <script src="tracker/ghosttrack.js"></script>

    <!-- Testing Functions -->
    <script>
        let eventCount = 0;
        let successCount = 0;
        let errorCount = 0;
        
        function updateStats() {
            document.getElementById('eventCount').textContent = eventCount;
            document.getElementById('successCount').textContent = successCount;
            document.getElementById('errorCount').textContent = errorCount;
        }
        
        function showMessage(msg, type = 'success') {
            const output = document.getElementById('output');
            const color = type === 'success' ? '#e8f5e9' : '#ffebee';
            const borderColor = type === 'success' ? '#4CAF50' : '#f44336';
            output.style.background = color;
            output.style.borderLeftColor = borderColor;
            output.innerHTML = `<strong>${type === 'success' ? '✅' : '❌'} ${msg}</strong><br><small>Check console and terminal for details</small>`;
            
            eventCount++;
            if (type === 'success') successCount++;
            else errorCount++;
            updateStats();
        }
        
        function testPageview() {
            ghostTrack.pageview();
            showMessage('Pageview event sent!');
        }
        
        function testClick() {
            ghostTrack.track('button_click', { 
                button_name: 'test_button',
                timestamp: Date.now(),
                page: window.location.href
            });
            showMessage('Click event sent!');
        }
        
        function testScroll() {
            ghostTrack.track('scroll', {
                scroll_depth: Math.random() * 100,
                page: window.location.href
            });
            showMessage('Scroll event sent!');
        }
        
        function testAddToCart() {
            ghostTrack.track('add_to_cart', {
                product_id: 'PROD-' + Math.floor(Math.random() * 1000),
                product_name: 'Test Product',
                price: 29.99,
                quantity: 1,
                currency: 'USD'
            });
            showMessage('Add to cart event sent!');
        }
        
        function testCheckout() {
            ghostTrack.track('checkout_started', {
                cart_total: 59.98,
                item_count: 2,
                currency: 'USD'
            });
            showMessage('Checkout event sent!');
        }
        
        function testPurchase() {
            ghostTrack.track('purchase_completed', {
                order_id: 'ORD-' + Date.now(),
                total: 59.98,
                currency: 'USD',
                payment_method: 'credit_card'
            });
            showMessage('Purchase event sent!');
        }
        
        function testBotBehavior() {
            // Simulate rapid-fire requests (bot-like behavior)
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    ghostTrack.track('suspicious_activity', {
                        type: 'rapid_requests',
                        count: i + 1
                    });
                }, i * 100);
            }
            showMessage('Bot simulation sent (5 rapid events)!');
        }
        
        // Auto-send pageview on load
        window.addEventListener('load', () => {
            console.log('🎯 GhostTrack Test Page Loaded');
        });
    </script>
</body>
</html>
```

**To test:**
1. Make sure backend is running
2. Open test.html in browser
3. Click buttons
4. Watch magic happen! 🎉

---

## 🚀 Command Cheat Sheet
```powershell
# Start everything
docker-compose up -d
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# Install packages
pip install package-name
pip freeze > requirements.txt

# Git
git add .
git commit -m "message"
git push
```

---

## 📈 Roadmap

**Week 1-2:** ✅ Setup & Basic API  
**Week 3:** Database & Data Persistence  
**Week 4:** Bot Detection  
**Week 5-6:** Frontend Dashboard  
**Week 7:** E-commerce Features  
**Week 8:** Polish & Documentation  
**Week 9-10:** Deploy & Launch  

---

## 🎯 Your Progress: 15% Complete! 

You've built the foundation. Next is making it actually save and analyze data!
