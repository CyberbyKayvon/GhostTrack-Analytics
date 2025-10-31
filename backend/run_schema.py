import sqlite3

# Connect to database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Read and execute SQL
with open('../schema_updates.sql', 'r') as f:
    sql_script = f.read()
    cursor.executescript(sql_script)

conn.commit()
conn.close()

print("✅ Database schema updated successfully!")

# Verify tables were created
conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("\n📋 Tables in database:")
for table in tables:
    print(f"  - {table[0]}")
conn.close()