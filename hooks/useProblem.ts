import useSWR from 'swr'
import { Problem, ProblemResponse, ApiError } from '../lib/types'

/**
 * Fetcher function for SWR - handles API calls and error responses
 */
const fetcher = async (url: string): Promise<ProblemResponse> => {
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
 * Hook to fetch a single problem by ID with its attempts
 * 
 * @param id - The problem ID to fetch (can be null/undefined to disable the request)
 * @returns Object containing problem data, loading state, error state, and revalidate function
 */
export function useProblem(id: number | null | undefined) {
  // Create the SWR key - null disables the request
  const swrKey = id ? `/api/problems/${id}` : null
  
  const { data, error, isLoading, mutate: revalidate } = useSWR<ProblemResponse>(
    swrKey,
    fetcher,
    {
      // Ensure immediate data fetching on mount
      revalidateOnMount: true,
      // Don't revalidate on focus to avoid unnecessary requests during navigation
      revalidateOnFocus: false,
      // Revalidate on reconnect to ensure fresh data
      revalidateOnReconnect: true,
      // Retry on error with faster intervals for better UX
      errorRetryCount: 2,
      errorRetryInterval: 500,
      // Reduce deduping interval to allow fresh requests when navigating
      dedupingInterval: 500,
      // Ensure we don't use stale data
      refreshInterval: 0,
      // Keep previous data while revalidating to prevent blank states
      keepPreviousData: false,
    }
  )

  return {
    problem: data?.data || null,
    isLoading,
    isError: !!error,
    error: error as ApiError,
    revalidate,
    // Helper to check if the problem exists (not loading and no error)
    exists: !isLoading && !error && !!data?.data,
    // Helper to check if the problem was not found (404 error)
    notFound: error?.status === 404
  }
}

/**
 * Hook variant that throws an error if the problem ID is not provided
 * Useful when you know the ID should always be available
 * 
 * @param id - The problem ID to fetch (required)
 * @returns Object containing problem data, loading state, error state, and revalidate function
 */
export function useRequiredProblem(id: number) {
  if (!id || id <= 0) {
    throw new Error('Problem ID is required and must be a positive number')
  }
  
  return useProblem(id)
}

/**
 * Hook to check if a problem exists without fetching full data
 * Useful for validation or conditional rendering
 * 
 * @param id - The problem ID to check
 * @returns Object with exists status and loading state
 */
export function useProblemExists(id: number | null | undefined) {
  const { exists, isLoading, notFound } = useProblem(id)
  
  return {
    exists,
    isLoading,
    notFound
  }
} 