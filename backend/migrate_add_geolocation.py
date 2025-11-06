"""
Database migration to add geolocation and VPN detection columns
Run this with: railway run python migrate_add_geolocation.py
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return

    print("🔄 Connecting to database...")

    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        print("✅ Connected successfully")
        print("📊 Adding geolocation columns...")

        # Add geographic columns
        migrations = [
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS city VARCHAR",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS region VARCHAR",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS country VARCHAR",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS country_code VARCHAR",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS is_vpn INTEGER DEFAULT 0"
        ]

        for sql in migrations:
            print(f"  Running: {sql}")
            cursor.execute(sql)

        conn.commit()
        print("✅ Migration completed successfully!")
        print("   Added columns: city, region, country, country_code, is_vpn")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate()
