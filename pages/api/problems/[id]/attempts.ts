import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { createCommit, createAttemptFile } from '../../../../lib/git'

/**
 * API endpoint for managing attempts on specific problems
 * 
 * GET /api/problems/:id/attempts - List all attempts for a specific problem
 * POST /api/problems/:id/attempts - Create a new attempt with Git integration
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract problem ID from URL parameters
    const { id } = req.query
    
    // Validate problem ID
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Problem ID is required and must be a single value'
      })
    }

    // Parse and validate problem ID as positive integer
    const problemId = parseInt(id as string, 10)
    if (isNaN(problemId) || problemId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Problem ID must be a positive integer'
      })
    }

    // Handle GET request - List all attempts for the problem
    if (req.method === 'GET') {
      // First verify that the problem exists
      const problem = await prisma.problem.findUnique({
        where: { id: problemId }
      })

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Problem with ID ${problemId} not found`
        })
      }

      // Fetch all attempts for this problem
      const attempts = await prisma.attempt.findMany({
        where: {
          problemId: problemId
        },
        orderBy: {
          timestamp: 'desc' // Most recent attempts first
        }
      })

      // Return successful response with attempts data
      return res.status(200).json({
        success: true,
        data: attempts,
        count: attempts.length,
        problemId: problemId
      })
    }

    // Handle POST request - Create a new attempt with Git integration and Python file creation
    if (req.method === 'POST') {
      const { code, note } = req.body

      // Validate required code field
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Python code is required and must be a non-empty string'
        })
      }

      // Validate note field (optional but must be string if provided)
      if (note !== undefined && note !== null && typeof note !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Attempt note must be a string if provided'
        })
      }

      // Character limit validation for attempt note (matching frontend limit)
      const NOTE_MAX_LENGTH = 500
      let trimmedNote: string | null = null

      if (note && typeof note === 'string') {
        trimmedNote = note.trim()
        
        if (trimmedNote.length > NOTE_MAX_LENGTH) {
          return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: `Attempt note must be ${NOTE_MAX_LENGTH} characters or less (currently ${trimmedNote.length} characters)`
          })
        }
        
        // Set to null if empty after trimming
        if (trimmedNote.length === 0) {
          trimmedNote = null
        }
      }

      // First verify that the problem exists
      const problem = await prisma.problem.findUnique({
        where: { id: problemId }
      })

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Problem with ID ${problemId} not found`
        })
      }

      // Create Python file for this attempt
      let filePath: string
      try {
        filePath = await createAttemptFile(problemId, code.trim())
      } catch (fileError) {
        console.error('❌ Failed to create attempt file:', fileError)
        
        return res.status(500).json({
          success: false,
          error: 'File creation error',
          message: fileError instanceof Error 
            ? `Failed to create Python file: ${fileError.message}`
            : 'Failed to create Python file for attempt'
        })
      }

      // Create Git commit message
      const commitMessage = trimmedNote && trimmedNote.length > 0 
        ? `codedeck attempt for "${problem.name}": ${trimmedNote}`
        : `codedeck attempt for "${problem.name}"`

      // Attempt to create Git commit (with automatic push)
      let commitHash: string
      try {
        commitHash = await createCommit(commitMessage)
      } catch (gitError) {
        console.error('❌ Git commit failed for attempt:', gitError)
        
        // Return error if Git commit fails
        return res.status(500).json({
          success: false,
          error: 'Git integration error',
          message: gitError instanceof Error 
            ? `Failed to create Git commit: ${gitError.message}`
            : 'Failed to create Git commit for attempt'
        })
      }

      // Create new attempt record in database with file path
      const newAttempt = await prisma.attempt.create({
        data: {
          problemId: problemId,
          commitHash: commitHash,
          note: trimmedNote,
          filePath: filePath
        }
      })

      // Update the problem's updatedAt timestamp to reflect recent activity
      await prisma.problem.update({
        where: { id: problemId },
        data: {
          updatedAt: new Date()
        }
      })

      // Return successful response with created attempt
      return res.status(201).json({
        success: true,
        data: newAttempt,
        message: 'Attempt created successfully with Git commit and Python file',
        commitHash: commitHash
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
    console.error('❌ API Error in /api/problems/[id]/attempts:', error)

    // Check if it's a Prisma foreign key constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        error: 'Foreign key constraint error',
        message: 'Referenced problem does not exist'
      })
    }

    // Return generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: req.method === 'POST' 
        ? 'Failed to create attempt in database'
        : 'Failed to fetch attempts from database'
    })
  }
} 