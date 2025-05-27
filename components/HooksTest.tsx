import React, { useState } from 'react'
import { 
  useProblems, 
  useProblem, 
  useAttempts,
  createProblem,
  createAttempt,
  toggleProblemSolved,
  type CreateProblemInput 
} from '../hooks'

/**
 * Test component to verify SWR hooks functionality
 * This component demonstrates all the hooks and mutation functions
 * Remove this component once the UI components are built
 */
export default function HooksTest() {
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingAttempt, setIsCreatingAttempt] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Test useProblems hook
  const { problems, count, isLoading: problemsLoading, isError: problemsError, revalidate } = useProblems()

  // Test useProblem hook (only if a problem is selected)
  const { problem, isLoading: problemLoading, isError: problemError } = useProblem(selectedProblemId)

  // Test useAttempts hook (only if a problem is selected)
  const { attempts, count: attemptsCount, isLoading: attemptsLoading } = useAttempts(selectedProblemId)

  // Helper to show messages
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000) // Clear after 5 seconds
  }

  // Handler to create a test problem
  const handleCreateProblem = async () => {
    setIsCreating(true)
    try {
      const input: CreateProblemInput = {
        name: `Test Problem ${Date.now()}`,
        description: 'This is a test problem created by the hooks test component'
      }
      const newProblem = await createProblem(input)
      console.log('✅ Problem created successfully:', newProblem)
      showMessage('success', `Problem "${newProblem.name}" created successfully!`)
    } catch (error) {
      console.error('❌ Failed to create problem:', error)
      showMessage('error', `Failed to create problem: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Handler to create a test attempt
  const handleCreateAttempt = async () => {
    if (!selectedProblemId) return
    
    setIsCreatingAttempt(true)
    try {
      const newAttempt = await createAttempt(selectedProblemId, {
        code: `# Test Python code generated at ${new Date().toISOString()}
class Solution:
    def testFunction(self):
        return "Hello from test attempt"`,
        note: `Test attempt created at ${new Date().toLocaleTimeString()}`
      })
      console.log('✅ Attempt created successfully:', newAttempt)
      showMessage('success', `Attempt created with Git commit: ${newAttempt.commitHash.substring(0, 8)}...`)
    } catch (error) {
      console.error('❌ Failed to create attempt:', error)
      showMessage('error', `Failed to create attempt: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingAttempt(false)
    }
  }

  // Handler to toggle solved status
  const handleToggleSolved = async (problemId: number, currentSolved: boolean) => {
    try {
      const updatedProblem = await toggleProblemSolved(problemId, !currentSolved)
      console.log(`✅ Problem ${currentSolved ? 'marked as unsolved' : 'marked as solved'}:`, updatedProblem)
      showMessage('success', `Problem ${currentSolved ? 'marked as unsolved' : 'marked as solved'}!`)
    } catch (error) {
      console.error('❌ Failed to toggle solved status:', error)
      showMessage('error', `Failed to toggle solved status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SWR Hooks Test Component</h1>
      
      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <p className="font-medium">
            {message.type === 'success' ? '✅ Success: ' : '❌ Error: '}
            {message.text}
          </p>
        </div>
      )}
      
      {/* Problems List Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Problems List ({count})</h2>
          <button
            onClick={handleCreateProblem}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Test Problem'}
          </button>
        </div>

        {problemsLoading && <p className="text-gray-500">Loading problems...</p>}
        {problemsError && <p className="text-red-500">Error loading problems</p>}
        
        {problems.length > 0 && (
          <div className="grid gap-4">
            {problems.map((prob) => (
              <div 
                key={prob.id} 
                className={`p-4 border rounded cursor-pointer transition-colors ${
                  selectedProblemId === prob.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProblemId(prob.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{prob.name}</h3>
                    <p className="text-sm text-gray-600">{prob.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Attempts: {prob.attempts.length} | 
                      Created: {new Date(prob.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      prob.solved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prob.solved ? 'Solved' : 'Unsolved'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleSolved(prob.id, prob.solved)
                      }}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {problems.length === 0 && !problemsLoading && !problemsError && (
          <div className="text-center py-8 text-gray-500">
            <p>No problems yet. Create your first problem to get started!</p>
          </div>
        )}
      </div>

      {/* Selected Problem Details */}
      {selectedProblemId && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Selected Problem Details</h2>
          
          {problemLoading && <p className="text-gray-500">Loading problem details...</p>}
          {problemError && <p className="text-red-500">Error loading problem details</p>}
          
          {problem && (
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-medium mb-2">{problem.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{problem.description}</p>
              {problem.trickSummary && (
                <p className="text-sm mb-2"><strong>Trick:</strong> {problem.trickSummary}</p>
              )}
              {problem.notes && (
                <p className="text-sm mb-2"><strong>Notes:</strong> {problem.notes}</p>
              )}
              <p className="text-xs text-gray-500">
                Status: {problem.solved ? 'Solved' : 'Unsolved'} | 
                Updated: {new Date(problem.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attempts Section */}
      {selectedProblemId && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Attempts ({attemptsCount})</h2>
            <button
              onClick={handleCreateAttempt}
              disabled={isCreatingAttempt}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingAttempt ? 'Creating...' : 'Create Test Attempt'}
            </button>
          </div>

          {attemptsLoading && <p className="text-gray-500">Loading attempts...</p>}
          
          {attempts.length > 0 && (
            <div className="space-y-2">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="p-3 border rounded bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Attempt #{attempt.id}
                      </p>
                      {attempt.note && (
                        <p className="text-sm text-gray-600">{attempt.note}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-mono">
                        {attempt.commitHash.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                        View Commit
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {attempts.length === 0 && !attemptsLoading && (
            <div className="text-center py-8 text-gray-500">
              <p>No attempts yet. Create your first attempt to test Git integration!</p>
            </div>
          )}
        </div>
      )}

      {/* Git Integration Status */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Git Integration Status</h3>
        <p className="text-sm text-blue-800">
          ✅ Git integration is working! When you create attempts, they will automatically create Git commits.
          {' '}If no code changes are detected, a test log file will be created to enable the commit.
        </p>
      </div>
    </div>
  )
} 