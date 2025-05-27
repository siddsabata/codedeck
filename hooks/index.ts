/**
 * Central export file for all SWR hooks and mutation functions
 * This provides a clean API for importing data-fetching functionality
 */

// Export all hooks and functions from useProblems
export {
  useProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  toggleProblemSolved
} from './useProblems'

// Export all hooks and functions from useProblem
export {
  useProblem,
  useRequiredProblem,
  useProblemExists
} from './useProblem'

// Export all hooks and functions from useAttempts
export {
  useAttempts,
  useRequiredAttempts,
  createAttempt,
  createAttemptWithNote,
  getCommitUrl,
  useAttemptStats
} from './useAttempts'

// Export attempt code hook
export {
  useAttemptCode
} from './useAttemptCode'

// Re-export types for convenience
export type {
  Problem,
  Attempt,
  CreateProblemInput,
  UpdateProblemInput,
  CreateAttemptInput,
  ApiError
} from '../lib/types' 