# Git Integration Module

This document explains how to set up and use the Git integration module in CodeDeck.

## Overview

The Git integration module (`lib/git.ts`) provides automatic Git commit functionality for tracking coding attempts. When users create new attempts for LeetCode problems, the system automatically commits their code changes to a configured Git repository.

## Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# GitHub Personal Access Token for authentication
GITHUB_PAT=your_github_personal_access_token_here

# Absolute path to your LeetCode solutions repository
GIT_REPO_PATH=/absolute/path/to/your/leetcode/solutions/repo

# Database URL (already configured)
DATABASE_URL="file:./prisma/dev.db"
```

### 2. GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with the following permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
3. Copy the token and add it to your `.env.local` file

### 3. LeetCode Solutions Repository

1. Create a separate Git repository for your LeetCode solutions
2. Clone it to your local machine
3. Set the absolute path to this repository in `GIT_REPO_PATH`

Example repository structure:
```
/path/to/leetcode-solutions/
├── .git/
├── README.md
├── two-sum/
│   ├── solution.py
│   ├── solution.js
│   └── notes.md
├── add-two-numbers/
│   ├── solution.py
│   └── notes.md
└── ...
```

## Usage

### Basic Usage

```typescript
import { createCommit } from '../lib/git'

// Create a commit with a message
try {
  const commitHash = await createCommit('Solved Two Sum problem - attempt 3')
  console.log('Commit created:', commitHash)
} catch (error) {
  console.error('Failed to create commit:', error)
}
```

### Available Functions

#### `createCommit(message: string): Promise<string>`

Creates a Git commit with the specified message and returns the commit hash.

- **Parameters**: `message` - The commit message
- **Returns**: Promise that resolves to the commit hash
- **Throws**: Error if Git operations fail or environment is not configured

#### `pushToRemote(remoteName?: string, branchName?: string): Promise<void>`

Pushes commits to the remote repository.

- **Parameters**: 
  - `remoteName` - Name of the remote (defaults to 'origin')
  - `branchName` - Name of the branch (defaults to 'main')
- **Returns**: Promise that resolves when push is complete

#### `getGitStatus(): Promise<object>`

Gets the current Git status of the repository.

- **Returns**: Promise that resolves to Git status information

#### `generateCommitUrl(commitHash: string, repoOwner: string, repoName: string): string`

Generates a GitHub URL for a specific commit.

- **Parameters**:
  - `commitHash` - The Git commit hash
  - `repoOwner` - GitHub username/organization
  - `repoName` - Repository name
- **Returns**: Full GitHub URL to the commit

## Testing

To test the Git integration:

1. Set up your environment variables
2. Make some changes in your LeetCode solutions repository
3. Run the test:

```bash
npx ts-node lib/git-test.ts
```

## Integration with CodeDeck

The Git integration is used in the following workflow:

1. User creates a new attempt for a LeetCode problem
2. User writes their solution code in their local LeetCode repository
3. User submits the attempt through CodeDeck UI
4. CodeDeck calls `createCommit()` with a descriptive message
5. The commit hash is stored in the database with the attempt record
6. User can click on the attempt to view the commit on GitHub

## Error Handling

The module includes comprehensive error handling for:

- Missing environment variables
- Invalid Git repository paths
- Empty commit messages
- No changes to commit
- Git operation failures
- Network issues during push operations

## Security Notes

- Keep your GitHub Personal Access Token secure
- Never commit your `.env.local` file to version control
- Use a dedicated repository for LeetCode solutions
- Consider using a fine-grained personal access token with minimal permissions

## Troubleshooting

### Common Issues

1. **"GITHUB_PAT environment variable is required"**
   - Make sure you've created `.env.local` with your GitHub token

2. **"Directory is not a valid Git repository"**
   - Ensure `GIT_REPO_PATH` points to a valid Git repository
   - Run `git init` in your solutions directory if needed

3. **"No changes to commit"**
   - Make sure you've made changes to files in your solutions repository
   - The module automatically stages all changes before committing

4. **Git push fails**
   - Check your internet connection
   - Verify your GitHub token has the correct permissions
   - Ensure the remote repository exists and is accessible 