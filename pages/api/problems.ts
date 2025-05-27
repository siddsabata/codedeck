import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

/**
 * API endpoint for managing LeetCode problems
 * 
 * GET /api/problems - List all problems with nested attempts
 * POST /api/problems - Create a new problem
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Handle GET request - List all problems with attempts
    if (req.method === 'GET') {
      // Fetch all problems from database with their related attempts
      // Include attempts ordered by timestamp (newest first)
      const problems = await prisma.problem.findMany({
        include: {
          attempts: {
            orderBy: {
              timestamp: 'desc' // Most recent attempts first
            }
          }
        },
        orderBy: [
          {
            solved: 'asc' // Unsolved problems first (false comes before true)
          },
          {
            updatedAt: 'asc' // Then by oldest updated date
          }
        ]
      })

      // Return successful response with problems data
      return res.status(200).json({
        success: true,
        data: problems,
        count: problems.length
      })
    }

    // Handle POST request - Create a new problem
    if (req.method === 'POST') {
      const { name, description } = req.body

      // Input validation - check required fields
      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Problem name is required and must be a string'
        })
      }

      if (!description || typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Problem description is required and must be a string'
        })
      }

      // Trim whitespace and validate non-empty strings
      const trimmedName = name.trim()
      const trimmedDescription = description.trim()

      if (trimmedName.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Problem name cannot be empty'
        })
      }

      if (trimmedDescription.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Problem description cannot be empty'
        })
      }

      // Character limit validation (matching frontend limits)
      const NAME_MAX_LENGTH = 100
      const DESCRIPTION_MAX_LENGTH = 1000

      if (trimmedName.length > NAME_MAX_LENGTH) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Problem name must be ${NAME_MAX_LENGTH} characters or less (currently ${trimmedName.length} characters)`
        })
      }

      if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Problem description must be ${DESCRIPTION_MAX_LENGTH} characters or less (currently ${trimmedDescription.length} characters)`
        })
      }

      // Create new problem in database
      const newProblem = await prisma.problem.create({
        data: {
          name: trimmedName,
          description: trimmedDescription
          // Other fields (trickSummary, notes, solved) will use their default values
          // solved defaults to false, others default to null
        },
        // Include attempts in response (will be empty array for new problem)
        include: {
          attempts: {
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      })

      // Return successful response with created problem
      return res.status(201).json({
        success: true,
        data: newProblem,
        message: 'Problem created successfully'
      })
    }

    // Method not allowed for unsupported HTTP methods
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `HTTP method ${req.method} is not supported for this endpoint`
    })

  } catch (error) {
    // Log error for debugging
    console.error('❌ API Error in /api/problems:', error)

    // Check if it's a Prisma validation error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Conflict error',
        message: 'A problem with this name already exists'
      })
    }

    // Return generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: req.method === 'POST' 
        ? 'Failed to create problem in database'
        : 'Failed to fetch problems from database'
    })
  }
} 