# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GhostTrack is an open-source, privacy-aware, security-focused behavioral analytics platform designed for web developers and cybersecurity professionals. It detects scraping, bots, automation, credential stuffing, and other anomalies while maintaining user privacy. The target market is e-commerce security analytics as a freemium SaaS or Shopify app.

## Tech Stack

**Backend:**
- FastAPI (Python) with Uvicorn ASGI server
- SQLAlchemy ORM with PostgreSQL (production) or SQLite (local development)
- Pydantic for data validation
- python-jose for JWT authentication
- passlib for password hashing

**Frontend:**
- React 19 with Vite build tool
- Tailwind CSS for styling
- React Router for navigation
- Recharts for analytics visualization
- Axios for API communication

**Infrastructure:**
- Docker Compose orchestrating PostgreSQL, Redis, backend, and frontend services
- Tracker: Vanilla JavaScript snippet served from backend at `/tracker/ghosttrack.js`

## Development Commands

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run development server (with auto-reload)
uvicorn app.main:app --reload

# Database migrations (if using Alembic)
alembic upgrade head
```

**Backend runs at:** http://localhost:8000
- API docs: http://localhost:8000/docs
- Test dashboard: http://localhost:8000/test
- Health check: http://localhost:8000/health

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

**Frontend runs at:** http://localhost:3000 or http://localhost:5173 (Vite default)

### Docker Development
```bash
# Start all services (PostgreSQL, Redis, backend, frontend)
docker-compose up

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build
```

### Quick Start Script
```powershell
# Windows PowerShell - starts backend server
.\start-ghosttrack.ps1
```

## Architecture

### Backend Structure (`backend/app/`)

```
app/
├── api/              # FastAPI route handlers (REST endpoints)
│   ├── events.py     # Event tracking endpoints
│   ├── analytics.py  # Analytics data retrieval
│   ├── auth.py       # User authentication (JWT)
│   └── threats.py    # Threat detection endpoints
├── core/             # Core infrastructure
│   ├── config.py     # Settings (via pydantic-settings)
│   ├── database.py   # SQLAlchemy engine, session, Base
│   └── security.py   # Password hashing, JWT tokens
├── models/           # SQLAlchemy ORM models
│   ├── event.py      # Event tracking model
│   ├── user.py       # User authentication model
│   └── threat.py     # Threat detection model
├── services/         # Business logic layer
│   ├── analytics_service.py  # Analytics aggregation
│   ├── bot_detection.py      # Bot detection heuristics
│   └── threat_analysis.py    # Threat scoring algorithms
└── utils/            # Helper utilities
```

**Additional Backend Files:**
- `backend/main.py` - FastAPI application entry point, CORS config, router registration
- `backend/routes/` - Additional route modules (e.g., heatmap)
- `backend/tracker/ghosttrack.js` - JavaScript tracking snippet served to clients

### Frontend Structure (`frontend/src/`)

```
src/
├── pages/
│   └── Dashboard.jsx          # Main dashboard page
├── components/
│   ├── common/                # Reusable UI components
│   └── dashboard/             # Dashboard-specific components
│       ├── EventsChart.jsx    # Event timeline chart
│       ├── EventsFeed.jsx     # Live event feed
│       ├── Heatmap.jsx        # Click heatmap visualization
│       ├── IPLookup.jsx       # IP geolocation lookup
│       ├── LatestVisits.jsx   # Recent visitor list
│       ├── SecurityAlerts.jsx # Threat alerts widget
│       ├── TodayStats.jsx     # Daily statistics cards
│       ├── TopPages.jsx       # Top pages by views
│       └── TrafficSources.jsx # Referrer breakdown
├── services/                  # API client layer
└── utils/                     # Frontend utilities
```

### Data Flow

1. **Event Tracking:**
   - Client website includes `ghosttrack.js` snippet
   - JavaScript sends events (pageview, click, scroll) to `/api/v1/events`
   - Backend validates via Pydantic schemas
   - Event stored in database with `bot_detection` applied
   - Threat analysis runs asynchronously

2. **Analytics Pipeline:**
   - Dashboard components fetch from `/api/v1/analytics/*`
   - `analytics_service.py` aggregates data using SQLAlchemy queries
   - Response cached in Redis (when available)
   - Frontend displays via Recharts visualizations

3. **Authentication:**
   - Users authenticate via `/api/v1/auth/login`
   - JWT token returned and stored in frontend
   - Protected routes verify token via `security.py` middleware

## Key Design Patterns

### Database Session Management
Backend uses dependency injection for database sessions:
```python
from app.core.database import get_db

@router.post("/events")
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    # db session auto-managed
```

### Dual Database Support
The application supports both SQLite (local development) and PostgreSQL (production):
- SQLite: Used for `heatmap_clicks` table and local testing
- PostgreSQL: Primary database via Docker Compose for events, users, threats
- Database URL configured via `settings.DATABASE_URL` in `app/core/config.py`

### Bot Detection Service
Located in `app/services/bot_detection.py`:
- Simple user-agent based detection using keyword matching
- Returns boolean for `is_bot` field on Event model
- Expandable to include rate limiting, fingerprinting, behavioral heuristics

### CORS Configuration
Main app (`backend/main.py`) configures allowed origins:
- Local development: `localhost:3000`, `localhost:5173`
- Production: Specific domains like `kayvontennis.com`, `dashboard.ghosttrack.app`
- Modify `allow_origins` list when adding new frontend domains

## Testing

The project currently relies on manual testing via the test dashboard at `/test`. Consider adding:
- Backend: `pytest` for API endpoint testing
- Frontend: `vitest` or `jest` for component testing
- E2E: Playwright or Cypress for full user flows

## Database Schema Notes

The `Event` model has commented-out fields for future enhancements:
- Geographic data (city, region, country, country_code)
- Device detection (device_type, browser)
- Referrer categorization (referrer_source)

These can be uncommented and migrated when implementing enhanced analytics features.

## Environment Variables

Backend configuration (via `pydantic-settings` in `app/core/config.py`):
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection (optional)
- `SECRET_KEY`: JWT signing key
- Additional settings in `.env` file (not tracked in git)

## Security Features

**Rate Limiting:**
- Event tracking: 100 requests/minute per IP (using slowapi)
- Heatmap tracking: 100 requests/minute per IP
- Returns 429 Too Many Requests when exceeded

**Authentication:**
- SECRET_KEY must be set via environment variable in production (fails startup if not set)
- Uses SHA-256 for session ID hashing (not MD5)
- JWT tokens with configurable expiration

**Environment Configuration:**
- All sensitive data via environment variables (see `.env.example`)
- Docker Compose uses env vars for database credentials
- `.env` files are gitignored

## Important Constraints

- The tracker JavaScript (`ghosttrack.js`) must remain lightweight and vanilla JS (no frameworks)
- Bot detection should err on the side of false negatives to avoid blocking legitimate users
- All analytics queries should be optimized with proper indexes (see `Event` model)
- GDPR/CCPA compliance requires privacy mode toggles (roadmap item)

## Recent Security Improvements

See `SECURITY_FIXES.md` for detailed documentation of security fixes applied on 2025-11-03:
- Database unified to SQLAlchemy (removed raw SQLite)
- Cryptographic security improvements (MD5 → SHA-256)
- Rate limiting added to prevent DoS
- SECRET_KEY enforcement in production
- Configurable API endpoints in tracker script
