import useSWR, { mutate } from 'swr'
import { 
  Attempt, 
  AttemptsListResponse, 
  AttemptResponse, 
  CreateAttemptInput,
  ApiError 
} from '../lib/types'

/**
 * Fetcher function for SWR - handles API calls and error responses
 */
const fetcher = async (url: string): Promise<AttemptsListResponse> => {
  const response = await fetch(url)
  const data = await response.json()
  
  // If the API returns success: false, throw an error for SWR to handle
  if (!data.success) {
    const error = new Error(data.message || 'API request failed') as any
    error.status = response.status
    error.info = data
    throw error
  }
  
  return data
}

/**
 * Hook to fetch all attempts for a specific problem
 * Returns attempts sorted by newest timestamp first
 * 
 * @param problemId - The problem ID to fetch attempts for (can be null/undefined to disable the request)
 * @returns Object containing attempts data, loading state, error state, and revalidate function
 */
export function useAttempts(problemId: number | null | undefined) {
  // Create the SWR key - null disables the request
  const swrKey = problemId ? `/api/problems/${problemId}/attempts` : null
  
  const { data, error, isLoading, mutate: revalidate } = useSWR<AttemptsListResponse>(
    swrKey,
    fetcher,
    {
      // Revalidate on focus to keep data fresh
      revalidateOnFocus: true,
      // Revalidate every 60 seconds when tab is active (attempts change less frequently)
      refreshInterval: 60000,
      // Don't revalidate on reconnect to avoid unnecessary requests
      revalidateOnReconnect: false,
      // Retry on error with exponential backoff
      errorRetryCount: 3,
      errorRetryInterval: 1000
    }
  )

  return {
    attempts: data?.data || [],
    count: data?.count || 0,
    problemId: data?.problemId || problemId,
    isLoading,
    isError: !!error,
    error: error as ApiError,
    revalidate,
    // Helper to get the most recent attempt
    latestAttempt: data?.data?.[0] || null,
    // Helper to check if there are any attempts
    hasAttempts: (data?.count || 0) > 0
  }
}

/**
 * Hook variant that throws an error if the problem ID is not provided
 * Useful when you know the problem ID should always be available
 * 
 * @param problemId - The problem ID to fetch attempts for (required)
 * @returns Object containing attempts data, loading state, error state, and revalidate function
 */
export function useRequiredAttempts(problemId: number) {
  if (!problemId || problemId <= 0) {
    throw new Error('Problem ID is required and must be a positive number')
  }
  
  return useAttempts(problemId)
}

/**
 * Mutation function to create a new attempt with Git integration
 * Automatically commits code to the connected Git repository and creates Python file
 * 
 * @param problemId - The problem ID to create an attempt for
 * @param input - The attempt input data (required code, optional note)
 * @returns Promise that resolves to the created attempt
 */
export async function createAttempt(
  problemId: number, 
  input: CreateAttemptInput
): Promise<Attempt> {
  try {
    const response = await fetch(`/api/problems/${problemId}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const data: AttemptResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to create attempt')
    }

    // Revalidate the attempts list and related caches
    await Promise.all([
      mutate(`/api/problems/${problemId}/attempts`),
      mutate('/api/problems'), // Revalidate problems list (updatedAt changes)
      mutate(`/api/problems/${problemId}`) // Revalidate individual problem
    ])

    return data.data
  } catch (error) {
    // Revalidate on error to ensure cache consistency
    await Promise.all([
      mutate(`/api/problems/${problemId}/attempts`),
      mutate('/api/problems'),
      mutate(`/api/problems/${problemId}`)
    ])
    throw error
  }
}

/**
 * Helper function to create an attempt with code and note
 * Convenience wrapper around createAttempt
 * 
 * @param problemId - The problem ID to create an attempt for
 * @param code - The Python code for the attempt
 * @param note - Optional note to include with the attempt
 * @returns Promise that resolves to the created attempt
 */
export async function createAttemptWithNote(
  problemId: number, 
  code: string,
  note?: string
): Promise<Attempt> {
  return createAttempt(problemId, { code, note })
}

/**
 * Helper function to get the commit URL for an attempt
 * Generates GitHub commit URL based on the commit hash
 * 
 * @param attempt - The attempt object containing commit hash
 * @param repoUrl - The GitHub repository URL (optional, can be inferred from env)
 * @returns The GitHub commit URL or null if not available
 */
export function getCommitUrl(attempt: Attempt, repoUrl?: string): string | null {
  if (!attempt.commitHash) {
    return null
  }
  
  // If repoUrl is provided, use it; otherwise try to construct from environment
  // This is a helper function - the actual URL generation might be handled by the git module
  if (repoUrl) {
    // Remove .git suffix if present and ensure it ends with commit hash
    const cleanRepoUrl = repoUrl.replace(/\.git$/, '')
    return `${cleanRepoUrl}/commit/${attempt.commitHash}`
  }
  
  // Return null if we can't construct the URL
  // In a real implementation, this might read from environment variables
  return null
}

/**
 * Hook to get attempt statistics for a problem
 * Provides useful metrics about attempts
 * 
 * @param problemId - The problem ID to get statistics for
 * @returns Object containing attempt statistics
 */
export function useAttemptStats(problemId: number | null | undefined) {
  const { attempts, isLoading, isError } = useAttempts(problemId)
  
  if (isLoading || isError || !attempts.length) {
    return {
      totalAttempts: 0,
      firstAttempt: null,
      lastAttempt: null,
      isLoading,
      isError
    }
  }
  
  // Attempts are already sorted by newest first
  const lastAttempt = attempts[0]
  const firstAttempt = attempts[attempts.length - 1]
  
  return {
    totalAttempts: attempts.length,
    firstAttempt,
    lastAttempt,
    isLoading: false,
    isError: false
  }
} 