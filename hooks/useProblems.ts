import useSWR, { mutate } from 'swr'
import { 
  Problem, 
  ProblemsListResponse, 
  ProblemResponse, 
  CreateProblemInput, 
  UpdateProblemInput,
  ApiError 
} from '../lib/types'

/**
 * Fetcher function for SWR - handles API calls and error responses
 */
const fetcher = async (url: string): Promise<any> => {
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
 * Hook to fetch all problems with their attempts
 * Returns problems sorted by: unsolved first, then by oldest updatedAt
 */
export function useProblems() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<ProblemsListResponse>(
    '/api/problems',
    fetcher,
    {
      // Revalidate on focus to keep data fresh
      revalidateOnFocus: true,
      // Revalidate every 30 seconds when tab is active
      refreshInterval: 30000,
      // Don't revalidate on reconnect to avoid unnecessary requests
      revalidateOnReconnect: false
    }
  )

  return {
    problems: data?.data || [],
    count: data?.count || 0,
    isLoading,
    isError: !!error,
    error: error as ApiError,
    revalidate
  }
}

/**
 * Mutation function to create a new problem
 * Optimistically updates the cache and revalidates on success/error
 */
export async function createProblem(input: CreateProblemInput): Promise<Problem> {
  try {
    const response = await fetch('/api/problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const data: ProblemResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to create problem')
    }

    // Revalidate the problems list to include the new problem
    await mutate('/api/problems')

    return data.data
  } catch (error) {
    // Revalidate on error to ensure cache consistency
    await mutate('/api/problems')
    throw error
  }
}

/**
 * Mutation function to update a problem
 * Updates both the problems list and individual problem cache
 */
export async function updateProblem(id: number, input: UpdateProblemInput): Promise<Problem> {
  try {
    const response = await fetch(`/api/problems/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const data: ProblemResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to update problem')
    }

    // Revalidate both the problems list and the individual problem
    await Promise.all([
      mutate('/api/problems'),
      mutate(`/api/problems/${id}`)
    ])

    return data.data
  } catch (error) {
    // Revalidate on error to ensure cache consistency
    await Promise.all([
      mutate('/api/problems'),
      mutate(`/api/problems/${id}`)
    ])
    throw error
  }
}

/**
 * Mutation function to delete a problem
 * Removes the problem from cache and revalidates
 */
export async function deleteProblem(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/problems/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete problem')
    }

    // Revalidate the problems list and clear the individual problem cache
    await Promise.all([
      mutate('/api/problems'),
      mutate(`/api/problems/${id}`, undefined, false) // Clear cache without revalidating
    ])
  } catch (error) {
    // Revalidate on error to ensure cache consistency
    await mutate('/api/problems')
    throw error
  }
}

/**
 * Mutation function to toggle the solved status of a problem
 * Convenience function that calls updateProblem with just the solved field
 */
export async function toggleProblemSolved(id: number, solved: boolean): Promise<Problem> {
  return updateProblem(id, { solved })
} 