import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createAttempt } from '../hooks/useAttempts'
import { useToast } from './ToastProvider'

interface AttemptModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to close the modal */
  onClose: () => void
  /** The problem ID to create an attempt for */
  problemId: number
  /** The problem name for display purposes */
  problemName: string
  /** Optional callback when attempt is successfully created */
  onSuccess?: (commitHash: string) => void
}

/**
 * Modal component for creating new coding attempts with Python code and animations
 * Prompts user for Python code (required) and optional commit note
 * Creates Python file and triggers Git integration
 */
const AttemptModal: React.FC<AttemptModalProps> = ({
  isOpen,
  onClose,
  problemId,
  problemName,
  onSuccess
}) => {
  const { showError } = useToast()
  
  const [code, setCode] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commitHash, setCommitHash] = useState<string | null>(null)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create attempt with code and optional note - this creates file and triggers Git commit
      const attempt = await createAttempt(problemId, { 
        code: code.trim(),
        note: note.trim() || undefined 
      })
      
      setCommitHash(attempt.commitHash)
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(attempt.commitHash)
      }
      
      // Auto-close modal after 2 seconds to show success state
      setTimeout(() => {
        handleClose()
      }, 2000)
      
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to create attempt. Please try again.'
      showError(errorMessage)
      setIsSubmitting(false)
    }
  }

  // Handle modal close - reset all state
  const handleClose = () => {
    if (!isSubmitting) {
      setCode('')
      setNote('')
      setCommitHash(null)
      onClose()
    }
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose()
    }
  }

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose()
    }
  }

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: -50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.1
      }
    }
  }

  const fieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  🔄 Add New Attempt
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  for &ldquo;{problemName}&rdquo;
                </p>
              </div>
              {!isSubmitting && (
                <motion.button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close modal"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!commitHash ? (
                // Form state
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Info message */}
                  <motion.div 
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    variants={fieldVariants}
                  >
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium mb-1">
                          This will create a Python file and commit to Git
                        </p>
                        <p className="text-blue-700">
                          Your code will be saved as <code className="bg-blue-100 px-1 rounded">attempts/problem-{problemId}/attempt.py</code> and automatically committed with Git history tracking.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Python code input */}
                  <motion.div variants={fieldVariants}>
                    <label htmlFor="attempt-code" className="block text-sm font-medium text-gray-700 mb-2">
                      Python Code <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="attempt-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="# Paste your LeetCode solution here...
class Solution:
    def twoSum(self, nums, target):
        # Your implementation here
        pass"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                      rows={12}
                      required
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        Paste your complete Python solution
                      </span>
                      <span className="text-xs text-gray-500">
                        {code.length} characters
                      </span>
                    </div>
                  </motion.div>

                  {/* Note input */}
                  <motion.div variants={fieldVariants}>
                    <label htmlFor="attempt-note" className="block text-sm font-medium text-gray-700 mb-2">
                      Commit Note (Optional)
                    </label>
                    <textarea
                      id="attempt-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Describe your approach, what you learned, or any notes about this solution..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      maxLength={500}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        Add context about your approach or solution
                      </span>
                      <span className="text-xs text-gray-500">
                        {note.length}/500
                      </span>
                    </div>
                  </motion.div>

                  {/* Form Actions */}
                  <motion.div 
                    className="flex space-x-3 pt-4"
                    variants={fieldVariants}
                  >
                    <motion.button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !code.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      whileHover={!isSubmitting && code.trim() ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting && code.trim() ? { scale: 0.98 } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div 
                            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Creating Attempt...
                        </>
                      ) : (
                        '🚀 Create Attempt'
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              ) : (
                // Success state
                <motion.div 
                  className="text-center py-8"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 0.6,
                      ease: "easeInOut"
                    }}
                  >
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Attempt Created Successfully! 🎉
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your code has been saved and committed to Git.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Commit Hash:</span>{' '}
                      <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {commitHash}
                      </code>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    This modal will close automatically...
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AttemptModal 