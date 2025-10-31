-- ========================================
-- GHOSTTRACK ANALYTICS - DATABASE SCHEMA UPDATES
-- Heatmaps, Session Replay & Geo-Demographics
-- ========================================

-- ========================================
-- HEATMAP CLICKS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS heatmap_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    x_position INTEGER NOT NULL,
    y_position INTEGER NOT NULL,
    viewport_width INTEGER NOT NULL,
    viewport_height INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_heatmap_site_page ON heatmap_clicks(site_id, page_url);
CREATE INDEX IF NOT EXISTS idx_heatmap_session ON heatmap_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_heatmap_timestamp ON heatmap_clicks(timestamp);

-- ========================================
-- SESSION REPLAY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS session_replays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    user_ip TEXT,
    events_data TEXT NOT NULL, -- JSON array of rrweb events
    duration INTEGER, -- seconds
    page_count INTEGER DEFAULT 1,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_replays_site_session ON session_replays(site_id, session_id);
CREATE INDEX IF NOT EXISTS idx_replays_started ON session_replays(started_at);
CREATE INDEX IF NOT EXISTS idx_replays_site_started ON session_replays(site_id, started_at);

-- ========================================
-- ENHANCED GEO-DEMOGRAPHICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS visitor_geo_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    country_code TEXT,
    country_name TEXT,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    timezone TEXT,
    isp TEXT,
    asn TEXT,
    is_vpn BOOLEAN DEFAULT 0,
    is_proxy BOOLEAN DEFAULT 0,
    connection_type TEXT,
    currency TEXT,
    languages TEXT, -- JSON array
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geo_site_country ON visitor_geo_data(site_id, country_code);
CREATE INDEX IF NOT EXISTS idx_geo_city ON visitor_geo_data(city);
CREATE INDEX IF NOT EXISTS idx_geo_timestamp ON visitor_geo_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_geo_session ON visitor_geo_data(session_id);

-- ========================================
-- DATA CLEANUP PROCEDURES
-- (Add these as scheduled tasks in your backend)
-- ========================================

-- Delete heatmap data older than 90 days
-- DELETE FROM heatmap_clicks WHERE timestamp < datetime('now', '-90 days');

-- Delete session replays older than 30 days
-- DELETE FROM session_replays WHERE started_at < datetime('now', '-30 days');

-- Anonymize geo data older than 90 days
-- UPDATE visitor_geo_data
-- SET ip_address = 'anonymized',
--     latitude = NULL,
--     longitude = NULL
-- WHERE timestamp < datetime('now', '-90 days');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if tables were created
-- SELECT name FROM sqlite_master WHERE type='table' AND name IN ('heatmap_clicks', 'session_replays', 'visitor_geo_data');

-- Check if indexes were created
-- SELECT name FROM sqlite_master WHERE type='index' AND tbl_name IN ('heatmap_clicks', 'session_replays', 'visitor_geo_data');

-- ========================================
-- SAMPLE TEST DATA (Optional - for testing)
-- ========================================

-- INSERT INTO heatmap_clicks (site_id, session_id, page_url, x_position, y_position, viewport_width, viewport_height)
-- VALUES (1, 'test_session_1', 'https://example.com/', 100, 200, 1920, 1080);

-- INSERT INTO session_replays (site_id, session_id, user_ip, events_data, started_at)
-- VALUES (1, 'test_session_1', '192.168.1.1', '[]', datetime('now'));

-- INSERT INTO visitor_geo_data (site_id, session_id, ip_address, country_code, country_name, city)
-- VALUES (1, 'test_session_1', '8.8.8.8', 'US', 'United States', 'Mountain View');

-- ========================================
-- SCHEMA COMPLETE
-- ========================================