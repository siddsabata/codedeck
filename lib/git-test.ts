/**
 * Simple test file for Git integration module
 * This file demonstrates how to use the Git integration functions
 * Run this with: npx ts-node lib/git-test.ts (after setting up environment variables)
 */

import { createCommit, getGitStatus, generateCommitUrl } from './git'

/**
 * Test function to demonstrate Git integration
 * Make sure to set GITHUB_PAT and GIT_REPO_PATH environment variables first
 */
async function testGitIntegration() {
  console.log('🧪 Testing Git Integration Module...\n')
  
  try {
    // Test 1: Get current Git status
    console.log('📊 Getting Git status...')
    const status = await getGitStatus()
    console.log('Current branch:', status.current)
    console.log('Modified files:', status.modified.length)
    console.log('Staged files:', status.staged.length)
    console.log('')
    
    // Test 2: Create a test commit (only if there are changes)
    if (status.files.length > 0) {
      console.log('💾 Creating test commit...')
      const commitMessage = `Test commit from CodeDeck - ${new Date().toISOString()}`
      const commitHash = await createCommit(commitMessage)
      console.log('✅ Commit created successfully!')
      console.log('Commit hash:', commitHash)
      console.log('')
      
      // Test 3: Generate commit URL
      console.log('🔗 Generating commit URL...')
      // Replace with your actual GitHub username and repo name
      const commitUrl = generateCommitUrl(commitHash, 'your-username', 'your-repo')
      console.log('Commit URL:', commitUrl)
      console.log('')
      
    } else {
      console.log('ℹ️  No changes to commit. Make some changes first to test commit functionality.\n')
    }
    
    console.log('✅ Git integration test completed successfully!')
    
  } catch (error) {
    console.error('❌ Git integration test failed:')
    console.error(error)
    
    if (error instanceof Error && error.message.includes('environment variable')) {
      console.log('\n💡 Make sure to set up your environment variables:')
      console.log('   GITHUB_PAT=your_github_personal_access_token')
      console.log('   GIT_REPO_PATH=/path/to/your/leetcode/solutions/repo')
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGitIntegration()
}

export { testGitIntegration } 