#!/bin/sh

# Database initialization script for codedeck
# Handles Prisma migrations and optional seeding

set -e  # Exit on any error

echo "🗄️  Initializing database..."

# Check if database file exists - if not, create it
if [ ! -f "./prisma/dev.db" ]; then
    echo "📋 Creating fresh database with schema..."
    # For fresh installations, use db push to create database and apply schema
    npx prisma db push
else
    echo "📋 Database exists, applying any pending migrations..."
    # For existing databases, use migrate deploy
    npx prisma migrate deploy
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database should be seeded
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database with sample problems..."
    npx prisma db seed || echo "ℹ️  Seed may have already run"
    echo "✅ Seed process complete!"
else
    echo "📝 Database ready - starting with empty tables"
fi

echo "✅ Database initialization complete!" 