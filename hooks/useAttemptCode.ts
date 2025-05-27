import useSWR from 'swr'

/**
 * Custom hook to fetch attempt code contents
 * Fetches the Python code for a specific attempt from the API
 */

// Response type for attempt code API
export interface AttemptCodeResponse {
  success: boolean
  data: {
    code: string
    filePath: string
    attempt: {
      id: number
      timestamp: string
      note: string | null
      commitHash: string
    }
    problem: {
      id: number
      name: string
    }
  }
  message?: string
}

// Fetcher function for attempt code
const fetchAttemptCode = async (url: string): Promise<AttemptCodeResponse> => {
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

/**
 * Hook to fetch attempt code
 * @param attemptId - The ID of the attempt to fetch code for
 * @param enabled - Whether to fetch the data (default: true)
 * @returns SWR result with attempt code data
 */
export function useAttemptCode(attemptId: number | null, enabled: boolean = true) {
  const shouldFetch = enabled && attemptId !== null && attemptId > 0
  
  const { data, error, isLoading, mutate } = useSWR<AttemptCodeResponse>(
    shouldFetch ? `/api/attempts/${attemptId}/code` : null,
    fetchAttemptCode,
    {
      // Don't revalidate on focus since code doesn't change often
      revalidateOnFocus: false,
      // Cache for 10 minutes since code files are relatively static
      dedupingInterval: 10 * 60 * 1000,
      // Retry once on error
      errorRetryCount: 1,
      // Show loading state immediately
      revalidateIfStale: true
    }
  )

  return {
    code: data?.data?.code,
    filePath: data?.data?.filePath,
    attempt: data?.data?.attempt,
    problem: data?.data?.problem,
    isLoading,
    isError: !!error,
    error: error?.message || null,
    revalidate: mutate
  }
} 