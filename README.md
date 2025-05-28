# codedeck - LeetCode Flashcards App

A modern, personal web application for managing LeetCode problems as interactive flashcards with integrated Git tracking for your coding attempts.

![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.7-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/siddsabata/codedeck.git
cd codedeck

# 2. Copy and configure environment
cp env.example .env
# Edit .env with your GitHub token and Git repository path

# 3. Run the startup script (handles database setup automatically)
./docker-start.sh
```

The script will guide you through setup, create a fresh database with optional sample data, and start the application at [http://localhost:3000](http://localhost:3000)

**✨ New Feature**: Database initialization is now **completely automatic**! No manual database setup required.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Recent Improvements](#recent-improvements)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## 🎯 Overview

CodeDeck transforms your LeetCode practice into an organized, trackable experience. Instead of losing track of problems you've worked on, CodeDeck lets you:

- **Organize problems as flashcards** with descriptions, tricks, and personal notes
- **Track your coding attempts** with automatic Git integration
- **Store and view your Python solutions** with syntax highlighting
- **Mark problems as solved** and track your progress
- **Review your approach** with editable trick summaries and notes

Perfect for developers who want to maintain a personal knowledge base of coding problems and solutions.

## 🆕 Recent Improvements

**✨ Simplified Setup (Latest Update)**:
- **🔧 Automatic Database Creation**: No manual database setup required - everything is handled automatically
- **🌱 Optional Sample Data**: Get started immediately with 3 example LeetCode problems  
- **📁 Proper Migrations**: Uses industry-standard Prisma migrations for reliable database schema
- **🚀 One-Command Start**: Single `./docker-start.sh` command handles everything
- **💾 Data Persistence**: Your progress automatically saves and survives container restarts

**🎯 Key Benefits**:
- **Zero Configuration**: Database setup is completely automatic
- **Production Ready**: Follows database best practices with proper migrations
- **User Friendly**: Sample data helps new users understand the app immediately
- **Reliable**: No more database path issues or complex initialization scripts

## ✨ Features

### 🃏 **Problem Management**
- Create and organize LeetCode problems as interactive flashcards
- Add detailed descriptions, trick summaries (50-word limit), and personal notes
- Mark problems as solved/unsolved with visual status indicators
- Sort problems by completion status and last activity

### 💻 **Code Tracking**
- Store Python code attempts with automatic Git integration
- View historical code versions for each attempt
- Automatic commit creation with descriptive messages
- GitHub integration with Personal Access Token authentication

### 🎨 **Modern UI/UX**
- Responsive design that works on desktop, tablet, and mobile
- Smooth animations powered by Framer Motion
- Toast notifications for user feedback
- Inline editing for trick summaries and notes
- Syntax highlighting for code viewing

## 🛠 Tech Stack

**Frontend:**
- **Next.js 15.3.2** - React framework with API routes
- **React 19.1.0** - UI library
- **TypeScript 5.8.3** - Type safety
- **Tailwind CSS 4.1.7** - Utility-first CSS framework
- **Framer Motion 12.14.0** - Smooth animations
- **SWR 2.3.3** - Data fetching and caching

**Backend:**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 6.8.2** - Database ORM and migrations
- **SQLite** - Lightweight database
- **simple-git 3.27.0** - Git integration

**Development:**
- **Docker & Docker Compose** - Containerized development
- **ESLint** - Code linting
- **react-hot-toast** - Toast notifications

## 📋 Prerequisites

Before installing CodeDeck, ensure you have:

1. **Docker and Docker Compose** installed on your system
2. **Git** installed and configured
3. **GitHub Personal Access Token** with repository permissions
4. **A Git repository** for storing your LeetCode attempts

## 🚀 Installation

### First-Time Setup

CodeDeck requires a **separate Git repository** to store your LeetCode attempt files. This is where your Python solutions will be automatically committed and tracked.

#### Step 1: Prepare Your Attempts Repository

**Create a new Git repository for your LeetCode attempts:**

```bash
# Create a new directory for your attempts
mkdir my-leetcode-attempts
cd my-leetcode-attempts

# Initialize as Git repository
git init

# Create initial commit
echo "# My LeetCode Attempts" > README.md
git add README.md
git commit -m "Initial commit"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/my-leetcode-attempts.git
git push -u origin main
```

**Important**: 
- This repository is **separate** from the CodeDeck application
- CodeDeck will create files like `attempts/problem-1/attempt.py` in this repository
- Each attempt gets automatically committed and pushed to this repository

#### Step 2: Get GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "CodeDeck Access"
4. Select scopes: `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token** - you'll need it in the next step

#### Step 3: Install CodeDeck

```bash
# Clone CodeDeck application
git clone https://github.com/siddsabata/codedeck.git
cd codedeck

# Copy environment template
cp .env.example .env
```

#### Step 4: Configure Environment

Edit `.env` with your actual values:

```bash
# Database (for Docker - uses absolute container path)
DATABASE_URL="file:/app/prisma/dev.db"

# Your GitHub Personal Access Token (from Step 2)
GITHUB_PAT="ghp_your_actual_token_here"

# ABSOLUTE path to your attempts repository (from Step 1)
GIT_REPO_PATH="/Users/yourusername/my-leetcode-attempts"

# Your Git identity for commits
GIT_USER_NAME="Your Full Name"
GIT_USER_EMAIL="your.email@example.com"
```

**Critical**: 
- `DATABASE_URL` uses Docker container path format (automatically handled)
- `GIT_REPO_PATH` must be the **absolute path** to your attempts repository
- Use the full path like `/Users/yourusername/my-leetcode-attempts` (not relative paths)

#### Step 5: Start CodeDeck

```bash
# Run the startup script (handles everything automatically)
./docker-start.sh
```

The script will:
- ✅ Validate your environment configuration
- ✅ Check that your Git repository exists
- ✅ **Ask if you want sample LeetCode problems** (recommended for first-time users)
- ✅ **Automatically create and initialize database** with Prisma migrations
- ✅ **Seed sample data** if requested (3 example problems: Two Sum, Valid Parentheses, Longest Substring)
- ✅ Let you choose development or production mode
- ✅ Start the application with the correct settings

**Choose option 1 (Development)** for the best experience with hot reloading.

Wait for the startup to complete, then open [http://localhost:3000](http://localhost:3000)

**🎉 That's it!** Your database is created automatically with proper schema and optional sample data.

### Daily Usage

After the first-time setup, starting CodeDeck is simple:

```bash
# Navigate to CodeDeck directory
cd codedeck

# Run the startup script
./docker-start.sh
```

**That's it!** The script will:
- ✅ Validate your environment is still configured correctly
- ✅ Start the web interface at http://localhost:3000
- ✅ Connect to your attempts repository
- ✅ Use your existing database (preserves all your data)

### Database Management

**Automatic Setup**: The database is created automatically on first run using Prisma migrations.

**Sample Data**: If you chose sample data during setup, you get 3 example problems:
- **Two Sum** (marked as solved) - Classic hash map problem
- **Valid Parentheses** (marked as solved) - Stack data structure example  
- **Longest Substring** (unsolved) - Sliding window technique

**Your Data**: All your problems, attempts, and progress are automatically saved and persist between sessions.

**Fresh Start**: Delete your database file to start completely fresh, or just delete individual sample problems through the UI.

### Stopping the Application

To stop CodeDeck when you're done:

```bash
# If running in foreground (you see logs), press:
Ctrl + C

# If running in background, stop with:
docker-compose down
```

The application will shut down gracefully and your data will be preserved.

### Alternative: Manual Docker Commands

If you prefer to use Docker commands directly instead of the startup script:

```bash
# Development mode
docker-compose up codedeck-dev

# Production mode  
docker-compose --profile production up codedeck-prod

# With build (if you've made changes)
docker-compose up --build codedeck-dev
```

**Note**: The startup script (`./docker-start.sh`) is recommended as it validates your environment and provides helpful guidance.

### How It Works

1. **You solve a LeetCode problem** on leetcode.com
2. **You create a problem card** in CodeDeck with the problem details
3. **You add an attempt** by pasting your Python solution
4. **CodeDeck automatically**:
   - Creates `attempts/problem-X/attempt.py` in your attempts repository
   - Commits the file with a descriptive message
   - Pushes to your GitHub repository
   - Tracks the commit hash for viewing later

### Troubleshooting

**Environment Issues**:
- Run `./docker-start.sh` - it will validate your configuration and guide you through fixes
- The script checks for common issues like missing `.env`, invalid paths, and placeholder values

**"Git repository not found"**: 
- The startup script will offer to create the repository for you
- Verify `GIT_REPO_PATH` is the absolute path to your attempts repository
- Make sure the directory exists and is a Git repository (`git status` should work)

**"Authentication failed"**: 
- Check your `GITHUB_PAT` is correct and has `repo` permissions
- Ensure your attempts repository remote URL is correct

**"Permission denied"**: 
- Make sure Docker can access your attempts repository directory
- On macOS/Linux, the path should be under your home directory

**Database Issues**:
- Database creation is **fully automatic** - no manual setup required
- If you encounter database problems, delete `prisma/dev.db` and restart the app
- The startup script will recreate a fresh database with proper schema
- Choose "Yes" for sample data if you want example problems to get started

**Script Permission Issues**:
```bash
# If you get "permission denied" when running the script:
chmod +x docker-start.sh
./docker-start.sh
```

**Fresh Installation**: If you're setting up on a new machine, simply:
1. Clone the repo
2. Copy and configure `.env`  
3. Run `./docker-start.sh`
4. Everything else is automatic!

## 📖 Usage

### Getting Started

1. **Create your first problem:**
   - Click "Add Problem" on the main page
   - Enter the problem name and description
   - Save to create your first flashcard

2. **Add attempt with code:**
   - Click on a problem card to view details
   - Click "Add Attempt" 
   - Paste your Python solution code
   - Add optional notes about your approach
   - Save to automatically commit to your Git repository

3. **Edit problem details:**
   - Click on any problem to view its detail page
   - Edit trick summaries and notes inline
   - Toggle solved status when you complete a problem

4. **View your code:**
   - Click "View Code" on any attempt to see your solution
   - Copy code to clipboard with one click
   - View historical versions of your solutions

### Key Workflows

**📝 Problem Creation:**
```
Main Page → Add Problem → Fill Form → Save
```

**💻 Adding Code Attempts:**
```
Problem Detail → Add Attempt → Paste Code → Add Notes → Save
```

**✏️ Editing Problem Info:**
```
Problem Detail → Click to Edit → Make Changes → Save/Cancel
```

**✅ Marking as Solved:**
```
Problem Detail → Click Solved Toggle → Status Updates
```

## 🏗 Project Structure

CodeDeck is built with a clean, modular architecture:

```
codedeck/
├── components/          # React UI components
├── hooks/              # Custom data fetching hooks
├── lib/                # Core utilities (Git, database, types)
├── pages/              # Next.js pages and API routes
├── prisma/             # Database schema and migrations
├── styles/             # Global styles
└── Docker files        # Development environment
```

**Key Technologies:**
- **Full-stack TypeScript** for type safety
- **Prisma ORM** with SQLite for data persistence
- **SWR** for efficient data fetching and caching
- **Docker** for consistent development environment
- **Git integration** for automatic code tracking

## 🙏 Acknowledgments

Built with modern web technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Smooth animations
- [Prisma](https://www.prisma.io/) - Database toolkit

---

**Happy coding! 🚀**

For questions or support, please open an issue on GitHub. 