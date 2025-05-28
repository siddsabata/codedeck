#!/bin/bash

# Docker entrypoint script for CodeDeck
# Handles database initialization and starts the application

set -e

echo "🚀 Starting CodeDeck..."

# Function to initialize database
init_database() {
    echo "📦 Initializing database..."
    
    # Generate Prisma client (in case it's not up to date)
    npx prisma generate
    
    # Run migrations to create the database and tables
    npx prisma migrate deploy
    
    echo "✅ Database initialized successfully!"
}

# Check if database file exists
if [ ! -f "/app/prisma/dev.db" ]; then
    echo "🔍 Database not found, initializing..."
    init_database
else
    echo "✅ Database found, checking for pending migrations..."
    # Always run migrate deploy to ensure we're up to date
    npx prisma migrate deploy || {
        echo "⚠️  Migration failed, but continuing..."
    }
fi

# Start the application with the provided command
echo "🎯 Starting application..."
exec "$@" 