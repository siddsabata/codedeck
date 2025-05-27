import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { readAttemptFile } from '../../../../lib/git'

/**
 * API endpoint to fetch attempt code contents
 * GET /api/attempts/[id]/code - Returns the Python code for a specific attempt
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  // Validate attempt ID
  const attemptId = typeof id === 'string' ? parseInt(id, 10) : null
  if (!attemptId || attemptId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid attempt ID',
      message: 'Attempt ID must be a positive integer'
    })
  }

  if (req.method === 'GET') {
    try {
      // Fetch the attempt from database to get the file path
      const attempt = await prisma.attempt.findUnique({
        where: { id: attemptId },
        include: {
          problem: true // Include problem info for context
        }
      })

      if (!attempt) {
        return res.status(404).json({
          success: false,
          error: 'Attempt not found',
          message: `No attempt found with ID ${attemptId}`
        })
      }

      if (!attempt.filePath) {
        return res.status(404).json({
          success: false,
          error: 'No code file available',
          message: 'This attempt does not have an associated code file'
        })
      }

      // Read the file contents from the specific Git commit for this attempt
      try {
        const code = await readAttemptFile(attempt.filePath, attempt.commitHash)
        
        return res.status(200).json({
          success: true,
          data: {
            code,
            filePath: attempt.filePath,
            attempt: {
              id: attempt.id,
              timestamp: attempt.timestamp,
              note: attempt.note,
              commitHash: attempt.commitHash
            },
            problem: {
              id: attempt.problem.id,
              name: attempt.problem.name
            }
          },
          message: 'Code retrieved successfully'
        })
        
      } catch (fileError) {
        console.error('Failed to read attempt file:', fileError)
        
        return res.status(500).json({
          success: false,
          error: 'File read error',
          message: fileError instanceof Error ? fileError.message : 'Failed to read code file'
        })
      }

    } catch (error) {
      console.error('Database error in GET /api/attempts/[id]/code:', error)
      
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Failed to fetch attempt'
      })
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `HTTP ${req.method} is not supported on this endpoint`
    })
  }
} 