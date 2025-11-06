"""
Migration script to add link tracking columns to events table
"""
import os
from sqlalchemy import create_engine, text

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment")
    exit(1)

# PostgreSQL requires driver to be postgresql:// not postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔗 Connecting to database...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        print("✅ Connected successfully!")

        # Check if columns already exist
        result = connection.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'events' AND column_name = 'link_url'
        """))

        if result.fetchone():
            print("✅ Columns already exist, no migration needed")
        else:
            print("📝 Adding new columns...")

            # Add link tracking columns
            connection.execute(text("""
                ALTER TABLE events
                ADD COLUMN IF NOT EXISTS link_url VARCHAR,
                ADD COLUMN IF NOT EXISTS link_text VARCHAR,
                ADD COLUMN IF NOT EXISTS is_pdf INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS opens_new_tab INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS is_external INTEGER DEFAULT 0
            """))

            connection.commit()
            print("✅ Migration completed successfully!")
            print("   - Added: link_url (VARCHAR)")
            print("   - Added: link_text (VARCHAR)")
            print("   - Added: is_pdf (INTEGER)")
            print("   - Added: opens_new_tab (INTEGER)")
            print("   - Added: is_external (INTEGER)")

except Exception as e:
    print(f"❌ Migration failed: {str(e)}")
    exit(1)
finally:
    engine.dispose()

print("\n✅ Migration script completed!")
