import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")

cursor.execute("SELECT COUNT(*) FROM heatmap_clicks")
print(f"\nHeatmap clicks: {cursor.fetchone()[0]}")

conn.close()