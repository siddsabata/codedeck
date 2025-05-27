import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

/**
 * API endpoint for individual problem operations
 * 
 * GET /api/problems/:id - Get single problem with attempts
 * PUT /api/problems/:id - Update problem fields (trickSummary, notes, solved)
 * DELETE /api/problems/:id - Delete a problem and all its attempts
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract and validate the problem ID from the URL
    const { id } = req.query
    const problemId = parseInt(id as string, 10)

    // Validate that ID is a valid number
    if (isNaN(problemId) || problemId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Problem ID must be a valid positive integer'
      })
    }

    // Handle GET request - Fetch single problem with attempts
    if (req.method === 'GET') {
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: {
          attempts: {
            orderBy: {
              timestamp: 'desc' // Most recent attempts first
            }
          }
        }
      })

      // Check if problem exists
      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Problem with ID ${problemId} not found`
        })
      }

      // Return the problem data
      return res.status(200).json({
        success: true,
        data: problem
      })
    }

    // Handle PUT request - Update problem fields
    if (req.method === 'PUT') {
      const { trickSummary, notes, solved } = req.body

      // Build update data object with only provided fields
      const updateData: any = {}

      // Character and word limits (matching frontend validation)
      const TRICK_SUMMARY_MAX_WORDS = 50
      const NOTES_MAX_CHARACTERS = 2000 // Reasonable limit for notes

      // Helper function to count words
      const countWords = (text: string): number => {
        return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
      }

      // Validate and add trickSummary if provided
      if (trickSummary !== undefined) {
        if (typeof trickSummary !== 'string' && trickSummary !== null) {
          return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'trickSummary must be a string or null'
          })
        }
        
        // Trim whitespace if it's a string
        if (typeof trickSummary === 'string') {
          const trimmedTrickSummary = trickSummary.trim()
          
          // Word count validation for trick summary
          if (trimmedTrickSummary.length > 0) {
            const wordCount = countWords(trimmedTrickSummary)
            if (wordCount > TRICK_SUMMARY_MAX_WORDS) {
              return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: `Trick summary must be ${TRICK_SUMMARY_MAX_WORDS} words or less (currently ${wordCount} words)`
              })
            }
          }
          
          updateData.trickSummary = trimmedTrickSummary === '' ? null : trimmedTrickSummary
        } else {
          updateData.trickSummary = null
        }
      }

      // Validate and add notes if provided
      if (notes !== undefined) {
        if (typeof notes !== 'string' && notes !== null) {
          return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'notes must be a string or null'
          })
        }
        
        // Trim whitespace if it's a string
        if (typeof notes === 'string') {
          const trimmedNotes = notes.trim()
          
          // Character count validation for notes
          if (trimmedNotes.length > NOTES_MAX_CHARACTERS) {
            return res.status(400).json({
              success: false,
              error: 'Validation error',
              message: `Notes must be ${NOTES_MAX_CHARACTERS} characters or less (currently ${trimmedNotes.length} characters)`
            })
          }
          
          updateData.notes = trimmedNotes === '' ? null : trimmedNotes
        } else {
          updateData.notes = null
        }
      }

      // Validate and add solved if provided
      if (solved !== undefined) {
        if (typeof solved !== 'boolean') {
          return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'solved must be a boolean value'
          })
        }
        updateData.solved = solved
      }

      // Check if any fields were provided for update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'At least one field (trickSummary, notes, or solved) must be provided for update'
        })
      }

      // Attempt to update the problem
      try {
        const updatedProblem = await prisma.problem.update({
          where: { id: problemId },
          data: updateData,
          include: {
            attempts: {
              orderBy: {
                timestamp: 'desc'
              }
            }
          }
        })

        return res.status(200).json({
          success: true,
          data: updatedProblem,
          message: 'Problem updated successfully'
        })

      } catch (updateError: any) {
        // Handle case where problem doesn't exist
        if (updateError.code === 'P2025') {
          return res.status(404).json({
            success: false,
            error: 'Not found',
            message: `Problem with ID ${problemId} not found`
          })
        }
        throw updateError // Re-throw other errors to be handled by outer catch
      }
    }

    // Handle DELETE request - Delete problem and all attempts
    if (req.method === 'DELETE') {
      try {
        // Delete the problem (attempts will be cascade deleted due to foreign key constraint)
        const deletedProblem = await prisma.problem.delete({
          where: { id: problemId },
          include: {
            attempts: true // Include attempts in response to show what was deleted
          }
        })

        return res.status(200).json({
          success: true,
          data: deletedProblem,
          message: `Problem "${deletedProblem.name}" and ${deletedProblem.attempts.length} attempts deleted successfully`
        })

      } catch (deleteError: any) {
        // Handle case where problem doesn't exist
        if (deleteError.code === 'P2025') {
          return res.status(404).json({
            success: false,
            error: 'Not found',
            message: `Problem with ID ${problemId} not found`
          })
        }
        throw deleteError // Re-throw other errors to be handled by outer catch
      }
    }

    // Method not allowed for unsupported HTTP methods
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `HTTP method ${req.method} is not supported for this endpoint`
    })

  } catch (error) {
    // Log error for debugging
    console.error('❌ API Error in /api/problems/[id]:', error)

    // Return generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the request'
    })
  }
} 