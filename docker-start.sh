#!/bin/bash

# codedeck Docker Startup Script
# Simple script to help you start the codedeck application with Docker

set -e  # Exit on any error

echo "🐳 codedeck Docker Startup"
echo "=========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Please create .env from the example:"
    echo "  cp .env.example .env"
    echo "  # Then edit .env with your actual values"
    echo ""
    echo "Required variables:"
    echo "  - GITHUB_PAT: Your GitHub Personal Access Token"
    echo "  - GIT_REPO_PATH: Absolute path to your LeetCode Git repository"
    echo "  - GIT_USER_NAME: Your name for Git commits"
    echo "  - GIT_USER_EMAIL: Your email for Git commits"
    echo ""
    read -p "Do you want me to copy the example file now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo "✅ Created .env from example"
        echo "📝 Please edit .env with your actual values before continuing"
        exit 0
    else
        echo "Please create .env manually and run this script again"
        exit 1
    fi
fi

# Source environment variables for validation
set -a  # Export all variables
source .env
set +a

# Validate required environment variables
echo "🔍 Validating environment..."

if [ -z "$GITHUB_PAT" ] || [ "$GITHUB_PAT" = "your PAT" ]; then
    echo "❌ GITHUB_PAT is not set or using example value"
    echo "Please update GITHUB_PAT in .env with your actual GitHub token"
    exit 1
fi

if [ -z "$GIT_REPO_PATH" ] || [ "$GIT_REPO_PATH" = "/absolute/path/to/your/problems/repo" ]; then
    echo "❌ GIT_REPO_PATH is not set or using example value"
    echo "Please update GIT_REPO_PATH in .env with your actual Git repository path"
    exit 1
fi

if [ -z "$GIT_USER_NAME" ] || [ "$GIT_USER_NAME" = "your name" ]; then
    echo "❌ GIT_USER_NAME is not set or using example value"
    echo "Please update GIT_USER_NAME in .env"
    exit 1
fi

if [ -z "$GIT_USER_EMAIL" ] || [ "$GIT_USER_EMAIL" = "your email" ]; then
    echo "❌ GIT_USER_EMAIL is not set or using example value"
    echo "Please update GIT_USER_EMAIL in .env"
    exit 1
fi

# Check if Git repository exists
if [ ! -d "$GIT_REPO_PATH" ]; then
    echo "❌ Git repository does not exist at: $GIT_REPO_PATH"
    echo ""
    read -p "Do you want me to create the Git repository? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$GIT_REPO_PATH"
        cd "$GIT_REPO_PATH"
        git init
        echo "# LeetCode Attempts" > README.md
        git add README.md
        git commit -m "Initial commit"
        cd - > /dev/null
        echo "✅ Created Git repository at: $GIT_REPO_PATH"
    else
        echo "Please create the Git repository manually at: $GIT_REPO_PATH"
        exit 1
    fi
fi

echo "✅ Environment validation passed!"
echo "📦 Database will be initialized automatically on first run"
echo ""

# Clean up any existing containers to avoid conflicts
echo "🧹 Cleaning up any existing containers..."
docker-compose down > /dev/null 2>&1 || true

echo "🚀 Starting codedeck in development mode..."
echo "📱 App will be available at: http://localhost:3000"
echo "🗄️  Database will be created automatically with Prisma migrations"
echo "📝 Starting with empty database - you can add your own problems"
echo ""
echo "⏳ Starting containers... (this may take a moment)"
docker-compose up --build codedeck-dev 