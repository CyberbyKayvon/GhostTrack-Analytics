"""
Database migration script - adds new columns to events table
Run this ONCE after deploying the updated model
"""
from sqlalchemy import text
from app.core.database import engine


def migrate():
    with engine.connect() as conn:
        # Add new columns if they don't exist
        migrations = [
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS city TEXT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS region TEXT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS country TEXT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS country_code TEXT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS device_type TEXT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS browser TEXT",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS referrer_source TEXT"
        ]

        for migration in migrations:
            try:
                conn.execute(text(migration))
                conn.commit()
                print(f"✅ {migration}")
            except Exception as e:
                print(f"⚠️  {migration} - {str(e)}")

        print("\n🎉 Migration complete!")


if __name__ == "__main__":
    migrate()