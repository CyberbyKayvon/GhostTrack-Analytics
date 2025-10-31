import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Drop old table with foreign key
cursor.execute('DROP TABLE IF EXISTS heatmap_clicks')

# Recreate without foreign key, site_id as TEXT
cursor.execute('''
CREATE TABLE heatmap_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    x_position INTEGER NOT NULL,
    y_position INTEGER NOT NULL,
    viewport_width INTEGER NOT NULL,
    viewport_height INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

cursor.execute('CREATE INDEX idx_heatmap_site_page ON heatmap_clicks(site_id, page_url)')
cursor.execute('CREATE INDEX idx_heatmap_session ON heatmap_clicks(session_id)')

conn.commit()
conn.close()

print("✅ Heatmap table fixed!")