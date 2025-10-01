import os
from app import app, db
from sqlalchemy import text

def migrate_database():
    with app.app_context():
        try:
            # Add firstName and lastName columns to users table if they don't exist
            db.session.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(80),
                ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(80)
            """))
            
            # Add breed column to pets table if it doesn't exist
            db.session.execute(text("""
                ALTER TABLE pets 
                ADD COLUMN IF NOT EXISTS breed VARCHAR(100)
            """))
            
            db.session.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Migration error: {e}")
            db.session.rollback()

if __name__ == '__main__':
    migrate_database()
