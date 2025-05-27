/**
 * TypeScript type definitions for codedeck data models
 * These types match the Prisma schema and API response formats
 */

// Base Problem type (matches Prisma model)
export interface Problem {
  id: number
  name: string
  description: string
  trickSummary: string | null
  notes: string | null
  solved: boolean
  createdAt: string // ISO date string from API
  updatedAt: string // ISO date string from API
  attempts: Attempt[]
}

// Base Attempt type (matches Prisma model)
export interface Attempt {
  id: number
  problemId: number
  timestamp: string // ISO date string from API
  commitHash: string
  note: string | null
  filePath: string // Path to the Python code file for this attempt
  problem?: Problem // Optional reverse relation
}

// API Response wrapper types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Specific API response types
export interface ProblemsListResponse extends ApiResponse<Problem[]> {
  count: number
}

export interface ProblemResponse extends ApiResponse<Problem> {}

export interface AttemptsListResponse extends ApiResponse<Attempt[]> {
  count: number
  problemId: number
}

export interface AttemptResponse extends ApiResponse<Attempt> {
  commitHash: string
}

// Input types for creating/updating data
export interface CreateProblemInput {
  name: string
  description: string
}

export interface UpdateProblemInput {
  trickSummary?: string | null
  notes?: string | null
  solved?: boolean
}

export interface CreateAttemptInput {
  code: string // Required Python code for the attempt
  note?: string
}

// Error types for better error handling
export interface ApiError {
  success: false
  error: string
  message: string
} 