import simpleGit, { SimpleGit } from 'simple-git'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Git integration module for CodeDeck
 * Handles automatic commits when users make coding attempts
 * Uses simple-git package with GitHub Personal Access Token authentication
 */

// Environment variables for Git configuration
const GITHUB_PAT = process.env.GITHUB_PAT
const GIT_REPO_PATH = process.env.GIT_REPO_PATH
const GIT_USER_NAME = process.env.GIT_USER_NAME
const GIT_USER_EMAIL = process.env.GIT_USER_EMAIL

/**
 * Validates that required environment variables are set
 * Throws an error if any required variables are missing
 */
function validateGitConfig(): void {
  if (!GITHUB_PAT) {
    throw new Error('GITHUB_PAT environment variable is required for Git integration')
  }
  
  if (!GIT_REPO_PATH) {
    throw new Error('GIT_REPO_PATH environment variable is required for Git integration')
  }
  
  if (!GIT_USER_NAME) {
    throw new Error('GIT_USER_NAME environment variable is required for Git integration')
  }
  
  if (!GIT_USER_EMAIL) {
    throw new Error('GIT_USER_EMAIL environment variable is required for Git integration')
  }
}

/**
 * Creates a Git instance configured for the specified repository
 * Sets up authentication using GitHub Personal Access Token
 */
function createGitInstance(): SimpleGit {
  validateGitConfig()
  
  // Create git instance pointing to the configured repository path
  const git = simpleGit(GIT_REPO_PATH!)
  
  return git
}

/**
 * Creates a test file to ensure there are changes to commit
 * This is useful for development/testing when no actual code changes exist
 */
async function createTestCommitFile(message: string): Promise<void> {
  const testFilePath = path.join(GIT_REPO_PATH!, '.codedeck-attempts.log')
  const timestamp = new Date().toISOString()
  const logEntry = `${timestamp}: ${message}\n`
  
  // Append to the test file (or create it if it doesn't exist)
  await fs.promises.appendFile(testFilePath, logEntry, 'utf8')
  
  console.log(`📝 Created test commit file entry: ${logEntry.trim()}`)
}

/**
 * Creates a Python attempt file for a specific problem
 * Creates directory structure: attempts/problem-{id}/attempt.py
 * Overwrites existing file to maintain single file per problem (Git tracks history)
 * 
 * @param problemId - The ID of the problem
 * @param code - The Python code to write to the file
 * @returns Promise<string> - The relative file path of the created file
 */
export async function createAttemptFile(problemId: number, code: string): Promise<string> {
  try {
    validateGitConfig()
    
    // Validate inputs
    if (!problemId || problemId <= 0) {
      throw new Error('Problem ID must be a positive integer')
    }
    
    if (!code || code.trim().length === 0) {
      throw new Error('Python code cannot be empty')
    }
    
    // Create directory structure: attempts/problem-{id}/
    const attemptsDir = path.join(GIT_REPO_PATH!, 'attempts')
    const problemDir = path.join(attemptsDir, `problem-${problemId}`)
    const filePath = path.join(problemDir, 'attempt.py')
    
    // Create directories if they don't exist
    await fs.promises.mkdir(problemDir, { recursive: true })
    
    // Write the Python code to the file (overwrites existing file)
    await fs.promises.writeFile(filePath, code.trim(), 'utf8')
    
    // Return relative path from repository root
    const relativePath = path.relative(GIT_REPO_PATH!, filePath)
    
    console.log(`📄 Created attempt file: ${relativePath}`)
    
    return relativePath
    
  } catch (error) {
    console.error('❌ Failed to create attempt file:', error)
    
    if (error instanceof Error) {
      throw new Error(`Failed to create attempt file: ${error.message}`)
    } else {
      throw new Error('Failed to create attempt file with unknown error')
    }
  }
}

/**
 * Creates a Git commit with the specified message and automatically pushes to remote
 * Automatically stages all changes before committing
 * If no changes exist, creates a test file to enable the commit (useful for development)
 * 
 * @param message - The commit message to use
 * @param autoPush - Whether to automatically push to remote after commit (default: true)
 * @returns Promise<string> - The commit hash of the created commit
 * 
 * @throws Error if Git operations fail or environment is not configured
 */
export async function createCommit(message: string, autoPush: boolean = true): Promise<string> {
  try {
    // Validate input
    if (!message || message.trim().length === 0) {
      throw new Error('Commit message cannot be empty')
    }
    
    const git = createGitInstance()
    
    // Check if the repository exists and is a valid Git repository
    const isRepo = await git.checkIsRepo()
    if (!isRepo) {
      throw new Error(`Directory ${GIT_REPO_PATH} is not a valid Git repository`)
    }
    
    // Configure Git user identity for commits (required in Docker environment)
    await git.addConfig('user.name', GIT_USER_NAME!)
    await git.addConfig('user.email', GIT_USER_EMAIL!)
    console.log(`🔧 Configured Git user: ${GIT_USER_NAME} <${GIT_USER_EMAIL}>`)
    
    // Stage all changes (including new files, modifications, and deletions)
    await git.add('.')
    
    // Check if there are any changes to commit
    const status = await git.status()
    if (status.files.length === 0) {
      console.log('⚠️  No changes detected, creating test commit file for development...')
      
      // Create a test file to enable the commit (useful for testing/development)
      await createTestCommitFile(message)
      
      // Stage the new test file
      await git.add('.')
      
      // Check status again
      const newStatus = await git.status()
      if (newStatus.files.length === 0) {
        throw new Error('No changes to commit even after creating test file')
      }
    }
    
    // Create the commit with the provided message
    const commitResult = await git.commit(message)
    
    // Extract the commit hash from the result
    const commitHash = commitResult.commit
    
    if (!commitHash) {
      throw new Error('Failed to retrieve commit hash from Git operation')
    }
    
    console.log(`✅ Git commit created successfully: ${commitHash}`)
    console.log(`📝 Commit message: ${message}`)
    
    // Automatically push to remote if requested
    if (autoPush) {
      try {
        await pushToRemote()
        console.log(`🚀 Automatically pushed commit to remote`)
      } catch (pushError) {
        console.warn('⚠️  Commit created but push failed:', pushError)
        // Don't throw here - commit was successful, push failure is non-critical
      }
    }
    
    return commitHash
    
  } catch (error) {
    console.error('❌ Git commit failed:', error)
    
    // Re-throw with more context for debugging
    if (error instanceof Error) {
      throw new Error(`Git commit failed: ${error.message}`)
    } else {
      throw new Error('Git commit failed with unknown error')
    }
  }
}

/**
 * Pushes commits to the remote repository
 * Optional function for syncing local commits to GitHub
 * 
 * @param remoteName - Name of the remote (defaults to 'origin')
 * @param branchName - Name of the branch (defaults to 'main')
 * @returns Promise<void>
 */
export async function pushToRemote(
  remoteName: string = 'origin', 
  branchName: string = 'main'
): Promise<void> {
  try {
    const git = createGitInstance()
    
    // Configure remote URL with GitHub PAT for authentication in Docker environment
    // This ensures the push works without interactive authentication
    const remotes = await git.getRemotes(true)
    const remote = remotes.find(r => r.name === remoteName)
    
    if (remote && remote.refs.push) {
      // Extract repository info from existing remote URL
      const httpsMatch = remote.refs.push.match(/https:\/\/github\.com\/(.+)\/(.+)\.git/)
      if (httpsMatch) {
        const [, owner, repo] = httpsMatch
        const authenticatedUrl = `https://${GITHUB_PAT}@github.com/${owner}/${repo}.git`
        
        console.log(`🔑 Configuring authenticated remote URL for ${remoteName}`)
        await git.remote(['set-url', remoteName, authenticatedUrl])
      }
    }
    
    // Push to the specified remote and branch
    await git.push(remoteName, branchName)
    
    console.log(`✅ Successfully pushed to ${remoteName}/${branchName}`)
    
  } catch (error) {
    console.error('❌ Git push failed:', error)
    
    if (error instanceof Error) {
      throw new Error(`Git push failed: ${error.message}`)
    } else {
      throw new Error('Git push failed with unknown error')
    }
  }
}

/**
 * Gets the current Git status of the repository
 * Useful for debugging and checking repository state
 * 
 * @returns Promise<object> - Git status information
 */
export async function getGitStatus(): Promise<any> {
  try {
    const git = createGitInstance()
    const status = await git.status()
    
    return {
      current: status.current,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
      staged: status.staged,
      modified: status.modified,
      created: status.created,
      deleted: status.deleted,
      renamed: status.renamed,
      files: status.files
    }
    
  } catch (error) {
    console.error('❌ Failed to get Git status:', error)
    throw error
  }
}

/**
 * Reads the contents of a file from a specific Git commit
 * 
 * @param filePath - The relative file path within the repository (e.g., "attempts/problem-1/attempt.py")
 * @param commitHash - The Git commit hash to read from
 * @returns Promise<string> - The contents of the file at that commit
 * 
 * @throws Error if file doesn't exist at that commit or cannot be read
 */
export async function readFileFromCommit(filePath: string, commitHash: string): Promise<string> {
  try {
    validateGitConfig()
    
    // Validate inputs
    if (!filePath || filePath.trim().length === 0) {
      throw new Error('File path cannot be empty')
    }
    
    if (!commitHash || commitHash.trim().length === 0) {
      throw new Error('Commit hash cannot be empty')
    }
    
    const git = createGitInstance()
    
    // Use git show to get file contents from specific commit
    // Format: git show <commit-hash>:<file-path>
    const contents = await git.show(`${commitHash}:${filePath}`)
    
    console.log(`📖 Read file from commit ${commitHash.substring(0, 8)}: ${filePath}`)
    
    return contents
    
  } catch (error) {
    console.error('❌ Failed to read file from commit:', error)
    
    if (error instanceof Error) {
      // Check if it's a "does not exist" error
      if (error.message.includes('does not exist') || error.message.includes('exists on disk, but not at')) {
        throw new Error(`File "${filePath}" not found in commit ${commitHash.substring(0, 8)}`)
      }
      throw new Error(`Failed to read file from commit: ${error.message}`)
    } else {
      throw new Error('Failed to read file from commit with unknown error')
    }
  }
}

/**
 * Reads the contents of an attempt file from the repository
 * Can read either from current working directory or from a specific commit
 * 
 * @param filePath - The relative file path within the repository (e.g., "attempts/problem-1/attempt.py")
 * @param commitHash - Optional: Git commit hash to read from. If not provided, reads current file
 * @returns Promise<string> - The contents of the file
 * 
 * @throws Error if file doesn't exist or cannot be read
 */
export async function readAttemptFile(filePath: string, commitHash?: string): Promise<string> {
  try {
    // If commit hash is provided, read from that specific commit
    if (commitHash) {
      return await readFileFromCommit(filePath, commitHash)
    }
    
    // Otherwise, read from current working directory (existing behavior)
    validateGitConfig()
    
    // Validate input
    if (!filePath || filePath.trim().length === 0) {
      throw new Error('File path cannot be empty')
    }
    
    // Construct the full path to the file
    const fullPath = path.join(GIT_REPO_PATH!, filePath)
    
    // Check if the file exists
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK)
    } catch (error) {
      throw new Error(`File not found: ${filePath}`)
    }
    
    // Read the file contents
    const contents = await fs.promises.readFile(fullPath, 'utf8')
    
    console.log(`📖 Read attempt file: ${filePath}`)
    
    return contents
    
  } catch (error) {
    console.error('❌ Failed to read attempt file:', error)
    
    if (error instanceof Error) {
      throw new Error(`Failed to read attempt file: ${error.message}`)
    } else {
      throw new Error('Failed to read attempt file with unknown error')
    }
  }
}

/**
 * Generates a commit URL for GitHub based on the commit hash
 * Assumes the repository is hosted on GitHub
 * 
 * @param commitHash - The Git commit hash
 * @param repoOwner - GitHub username/organization
 * @param repoName - Repository name
 * @returns string - Full GitHub URL to the commit
 */
export function generateCommitUrl(
  commitHash: string, 
  repoOwner: string, 
  repoName: string
): string {
  return `https://github.com/${repoOwner}/${repoName}/commit/${commitHash}`
} 