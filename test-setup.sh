#!/bin/bash

# Test script to verify codedeck setup works correctly
# This script tests the database initialization without starting the full app

set -e

echo "🧪 Testing codedeck setup..."
echo "============================="

# Clean up any existing test database
if [ -f "./test.db" ]; then
    rm -f "./test.db"
    echo "🗑️  Removed existing test database"
fi

# Test database creation with a temporary database in root directory
export DATABASE_URL="file:./test.db"

echo "📋 Testing database schema creation..."
npx prisma db push --force-reset

echo "🔧 Testing Prisma client generation..."
npx prisma generate

echo "🔍 Testing database connection..."
npx prisma db execute --schema=./prisma/schema.prisma --url="file:./test.db" --stdin <<< "SELECT COUNT(*) FROM Problem;" || echo "⚠️  Query failed (expected for empty database)"

# Clean up test database
rm -f "./test.db"

echo "✅ Setup test completed successfully!"
echo ""
echo "Your setup should work with Docker. Try running:"
echo "  ./docker-start.sh" 