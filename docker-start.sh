#!/bin/bash

# codedeck Docker Startup Script
# This script helps you start the codedeck application with Docker

set -e  # Exit on any error

echo "🐳 codedeck Docker Startup"
echo "=========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env.docker exists
if [ ! -f ".env.docker" ]; then
    echo "⚠️  .env.docker not found!"
    echo ""
    echo "Please create .env.docker from the example:"
    echo "  cp env.docker.example .env.docker"
    echo "  # Then edit .env.docker with your actual values"
    echo ""
    echo "Required variables (without quotes):"
    echo "  - GITHUB_PAT: Your GitHub Personal Access Token"
    echo "  - GIT_REPO_PATH: Absolute path to your LeetCode Git repository"
    echo ""
    read -p "Do you want me to copy the example file now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp env.docker.example .env.docker
        echo "✅ Created .env.docker from example"
        echo "📝 Please edit .env.docker with your actual values before continuing"
        echo "🚨 IMPORTANT: Remove quotes from values in .env.docker (Docker requirement)"
        exit 0
    else
        echo "Please create .env.docker manually and run this script again"
        exit 1
    fi
fi

# Source environment variables for validation
set -a  # Export all variables
source .env.docker
set +a

# Validate required environment variables
echo "🔍 Validating environment..."

if [ -z "$GITHUB_PAT" ] || [ "$GITHUB_PAT" = "ghp_your_github_personal_access_token_here" ]; then
    echo "❌ GITHUB_PAT is not set or using example value"
    echo "Please update GITHUB_PAT in .env.docker with your actual GitHub token"
    exit 1
fi

if [ -z "$GIT_REPO_PATH" ] || [ "$GIT_REPO_PATH" = "/Users/yourusername/dev/my-leetcode-repo" ]; then
    echo "❌ GIT_REPO_PATH is not set or using example value"
    echo "Please update GIT_REPO_PATH in .env.docker with your actual Git repository path"
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

# Check if database exists, create if not
if [ ! -f "./prisma/dev.db" ]; then
    echo "📦 Database not found, will be created on first run"
fi

echo "✅ Environment validation passed!"
echo ""

# Ask user which mode to run
echo "Which mode would you like to run?"
echo "1) Development (recommended) - Port 3000 with hot reloading"
echo "2) Production - Port 3001 optimized build"
echo "3) Database Studio - Port 5555 for database management"
echo "4) Run setup check only"
echo ""
read -p "Enter your choice (1-4): " -n 1 -r
echo

case $REPLY in
    1)
        echo "🚀 Starting development mode..."
        docker-compose up --build codedeck-dev
        ;;
    2)
        echo "🚀 Starting production mode..."
        docker-compose --profile production up --build codedeck-prod
        ;;
    3)
        echo "🚀 Starting Prisma Studio..."
        docker-compose --profile studio up --build prisma-studio
        ;;
    4)
        echo "🔍 Running setup check..."
        docker-compose --profile setup up setup-check
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac 