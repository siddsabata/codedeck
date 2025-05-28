#!/bin/sh

# Database initialization script for codedeck
# Handles Prisma migrations and schema creation

set -e  # Exit on any error

echo "🗄️  Initializing database..."

# Wait a moment for volume mounts to be ready
sleep 2

# Ensure prisma directory exists and has proper permissions
mkdir -p ./prisma
chmod 755 ./prisma

# Check if database path exists as a directory (Docker volume mount issue)
if [ -d "./prisma/dev.db" ]; then
    echo "⚠️  Found directory instead of database file, removing..."
    rm -rf "./prisma/dev.db"
fi

# Check if database file exists
if [ ! -f "./prisma/dev.db" ]; then
    echo "📋 Creating fresh database with schema..."
    
    # For fresh installations, use db push to create database and apply schema
    # This avoids migration conflicts on new databases
    npx prisma db push --force-reset
    
    echo "✅ Fresh database created successfully!"
else
    echo "📋 Database exists, checking if migrations are needed..."
    
    # Check if migrations directory exists and has migrations
    if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
        echo "📋 Found existing migrations, checking migration status..."
        
        # Try to get migration status - if it fails, the database might need baseline
        if ! npx prisma migrate status > /dev/null 2>&1; then
            echo "📋 Database needs migration baseline, applying schema..."
            # Reset and push current schema
            npx prisma db push --force-reset
        else
            echo "📋 Applying any pending migrations..."
            npx prisma migrate deploy
        fi
    else
        echo "📋 No migrations found, pushing current schema..."
        npx prisma db push
    fi
    
    echo "✅ Database schema updated successfully!"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📝 Database ready - starting with existing data or empty tables"
echo "✅ Database initialization complete!" 