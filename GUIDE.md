# 🎯 GhostTrack - Complete Setup & Next Steps Guide

## ✅ What's Working Now
- Project structure created
- Backend API running
- Docker database ready
- Git repository set up

---

## 🚀 IMMEDIATE NEXT STEPS

### Step 1: Fix Git Issue (Do Now)
```powershell
# In root directory
cd C:\Users\ktkka\PycharmProjects\GhostTrack-Analytics

# Remove venv from git
git rm -r --cached backend/venv
git commit -m "Remove venv from tracking"
git pull origin main
git push origin main
```

### Step 2: Make Sure .gitignore is Correct

**Check that ``.gitignore`` has these lines:**
```
# Python
venv/
env/
*.pyc
__pycache__/

# Node
node_modules/

# Environment
.env

# Database
*.db
*.sqlite
```

### Step 3: Restart Backend
```powershell
# Go to backend
cd backend

# Activate venv
.\venv\Scripts\Activate.ps1

# Start server
uvicorn app.main:app --reload
```

**You should see:**
```
🚀 Starting GhostTrack API...
📊 Initializing database...
✅ Database initialized successfully!
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 4: Test Event Tracking

1. **Open browser:** http://localhost:8000/docs
2. **Go to:** `POST /api/v1/events/track`
3. **Click:** "Try it out"
4. **Paste:**
```json
{
  "site_id": "my-test-store",
  "event_type": "pageview",
  "url": "https://mystore.com/homepage",
  "referrer": "https://google.com",
  "user_agent": "Mozilla/5.0",
  "session_id": "sess_123456",
  "metadata": {
    "page_title": "My Store",
    "test": true
  }
}
```
5. **Click:** Execute
6. **Check terminal:** Should see `✅ 📊 Event SAVED to database! ID: 1`

---

## 📊 Phase 2: Add Analytics Endpoint

### Update `backend/app/api/analytics.py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.event import Event

router = APIRouter()

@router.get("/")
async def get_analytics(db: Session = Depends(get_db)):
    """
    Get analytics overview
    """
    try:
        # Total events
        total_events = db.query(func.count(Event.id)).scalar() or 0
        
        # Unique visitors (by session_id)
        unique_visitors = db.query(func.count(func.distinct(Event.session_id))).filter(
            Event.session_id.isnot(None)
        ).scalar() or 0
        
        # Events today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        events_today = db.query(func.count(Event.id)).filter(
            Event.timestamp >= today_start
        ).scalar() or 0
        
        # Recent events (last 10)
        recent_events = db.query(Event).order_by(Event.timestamp.desc()).limit(10).all()
        
        # Top event types
        top_events = db.query(
            Event.event_type,
            func.count(Event.id).label('count')
        ).group_by(Event.event_type).order_by(func.count(Event.id).desc()).limit(5).all()
        
        return {
            "total_events": total_events,
            "unique_visitors": unique_visitors,
            "events_today": events_today,
            "recent_events": [
                {
                    "id": e.id,
                    "event_type": e.event_type,
                    "site_id": e.site_id,
                    "url": e.url,
                    "timestamp": e.timestamp.isoformat()
                }
                for e in recent_events
            ],
            "top_event_types": [
                {"event_type": et, "count": count}
                for et, count in top_events
            ]
        }
    except Exception as e:
        return {
            "error": str(e),
            "total_events": 0,
            "unique_visitors": 0
        }

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    Get detailed statistics
    """
    try:
        # Bot vs Human traffic
        total = db.query(func.count(Event.id)).scalar() or 0
        bots = db.query(func.count(Event.id)).filter(Event.is_bot == 1).scalar() or 0
        humans = total - bots
        
        # Threats detected
        threats = db.query(func.count(Event.id)).filter(Event.threat_score > 50).scalar() or 0
        
        return {
            "total_requests": total,
            "human_traffic": humans,
            "bot_traffic": bots,
            "threats_detected": threats,
            "bot_percentage": round((bots / total * 100) if total > 0 else 0, 2)
        }
    except Exception as e:
        return {"error": str(e)}
```

**Restart backend and test:** http://localhost:8000/api/v1/analytics/

---

## 🧪 Phase 3: Test with HTML Page

### Create `test.html` in project root:
```html
<!DOCTYPE html>
<html>
<head>
    <title>GhostTrack Test Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 15px;
            color: white;
            text-align: center;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .section {
            margin: 40px 0;
        }
        .section-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        button {
            padding: 15px 30px;
            margin: 10px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 10px;
            transition: all 0.3s;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }
        .btn-warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        .btn-danger {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
        }
        #output {
            margin-top: 30px;
            padding: 25px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #667eea;
            min-height: 100px;
            font-size: 1.1em;
        }
        .success { color: #38ef7d; }
        .error { color: #f5576c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>👻 GhostTrack Testing Dashboard</h1>
        <p class="subtitle">Real-time event tracking & analytics testing</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="eventCount">0</div>
                <div class="stat-label">Events Sent</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="successCount">0</div>
                <div class="stat-label">Successful</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="errorCount">0</div>
                <div class="stat-label">Errors</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📊 Basic Events</h2>
            <button class="btn-primary" onclick="testPageview()">📄 Pageview</button>
            <button class="btn-primary" onclick="testClick()">🖱️ Click</button>
            <button class="btn-primary" onclick="testScroll()">📜 Scroll</button>
        </div>

        <div class="section">
            <h2 class="section-title">🛒 E-commerce Events</h2>
            <button class="btn-success" onclick="testAddToCart()">🛒 Add to Cart</button>
            <button class="btn-success" onclick="testCheckout()">💳 Checkout</button>
            <button class="btn-success" onclick="testPurchase()">✅ Purchase</button>
        </div>

        <div class="section">
            <h2 class="section-title">🤖 Security Testing</h2>
            <button class="btn-warning" onclick="testBotBehavior()">🤖 Simulate Bot</button>
            <button class="btn-danger" onclick="testRapidFire()">⚡ Rapid Fire (10x)</button>
        </div>

        <div id="output">
            <strong>🎯 Waiting for events...</strong><br>
            <small>Open browser console (F12) and backend terminal to see real-time tracking!</small>
        </div>
    </div>

    <!-- GhostTrack Configuration -->
    <script>
        window.ghostTrackUrl = 'http://localhost:8000/api/v1/events/track';
        window.ghostTrackSiteId = 'test-store-001';
        window.ghostTrackDebug = true;
    </script>
    
    <!-- Load Tracker -->
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
            const icon = type === 'success' ? '✅' : '❌';
            const className = type === 'success' ? 'success' : 'error';
            
            output.innerHTML = `
                <strong class="${className}">${icon} ${msg}</strong><br>
                <small>Time: ${new Date().toLocaleTimeString()}</small><br>
                <small>Check console (F12) and terminal for details</small>
            `;
            
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
                timestamp: Date.now()
            });
            showMessage('Click event sent!');
        }
        
        function testScroll() {
            ghostTrack.track('scroll', {
                scroll_depth: Math.floor(Math.random() * 100)
            });
            showMessage('Scroll event sent!');
        }
        
        function testAddToCart() {
            ghostTrack.track('add_to_cart', {
                product_id: 'PROD-' + Math.floor(Math.random() * 1000),
                product_name: 'Test Product',
                price: 29.99,
                quantity: 1
            });
            showMessage('Add to cart event sent!');
        }
        
        function testCheckout() {
            ghostTrack.track('checkout_started', {
                cart_total: 59.98,
                item_count: 2
            });
            showMessage('Checkout event sent!');
        }
        
        function testPurchase() {
            ghostTrack.track('purchase_completed', {
                order_id: 'ORD-' + Date.now(),
                total: 59.98
            });
            showMessage('Purchase completed event sent!');
        }
        
        function testBotBehavior() {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    ghostTrack.track('suspicious_activity', {
                        type: 'rapid_requests',
                        count: i + 1
                    });
                }, i * 100);
            }
            showMessage('Bot simulation: 5 rapid events sent!');
        }
        
        function testRapidFire() {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    ghostTrack.track('rapid_test', {
                        index: i + 1,
                        timestamp: Date.now()
                    });
                }, i * 50);
            }
            showMessage('Rapid fire: 10 events sent!');
        }
        
        console.log('🎯 GhostTrack Test Dashboard Loaded!');
    </script>
</body>
</html>
```

**Test it:**
1. Make sure backend is running
2. Open `test.html` in browser
3. Click buttons and watch events save!

---

## 🚀 Phase 4: What's Next

### Week 1-2: ✅ DONE
- [x] Project setup
- [x] Backend API
- [x] Database models
- [x] Event tracking

### Week 3: Database & Analytics
- [ ] Add more analytics endpoints
- [ ] Create dashboard queries
- [ ] Add date range filters

### Week 4: Bot Detection
- [ ] Implement bot detection service
- [ ] Add threat scoring
- [ ] Create blocking rules

### Week 5-6: Frontend Dashboard
- [ ] Set up React
- [ ] Create dashboard components
- [ ] Add real-time updates

### Week 7: E-commerce Features
- [ ] Shopify integration
- [ ] WooCommerce plugin
- [ ] Cart tracking

### Week 8-10: Polish & Launch
- [ ] Documentation
- [ ] Deploy to production
- [ ] Launch on Product Hunt

---

## 💡 Command Cheat Sheet
```powershell
# Start backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# Start database
docker-compose up -d

# Install package
pip install package-name
pip freeze > requirements.txt

# Git commands
git add .
git commit -m "message"
git push
```

---

## 🎯 Your Progress: 20% Complete!

✅ Project structure  
✅ Backend API running  
✅ Database connected  
✅ Events saving to database  
⬜ Analytics dashboard  
⬜ Bot detection  
⬜ Frontend UI  

---

## 🆘 Troubleshooting

### Backend won't start
```powershell
# Check if venv is active (should see (venv) in prompt)
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Database errors
```powershell
# Check if Docker is running
docker ps

# Restart database
docker-compose down
docker-compose up -d postgres
```

### Can't push to GitHub
```powershell
# Remove venv from tracking
git rm -r --cached backend/venv
git commit -m "Remove venv"
git push
```

---

## 🎊 You Did It!

You've built:
- ✅ A working analytics API
- ✅ Database that saves events
- ✅ JavaScript tracker
- ✅ Testing dashboard

**This is real progress!** Take a break, then come back to build the analytics queries and bot detection. You're 20% done with the MVP! 🚀
