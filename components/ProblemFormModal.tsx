import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createProblem } from '../hooks/useProblems'
import { useToast } from './ToastProvider'

interface ProblemFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (problemName: string) => void
}

/**
 * Modal component for creating new problems with animations and toast notifications
 * Includes form validation and user-friendly error handling
 */
const ProblemFormModal: React.FC<ProblemFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showError } = useToast()
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form validation state
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  // Character limits
  const NAME_MAX_LENGTH = 100
  const DESCRIPTION_MAX_LENGTH = 1000

  /**
   * Reset form when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setNameError('')
      setDescriptionError('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    let isValid = true
    
    // Reset errors
    setNameError('')
    setDescriptionError('')

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Problem name is required')
      isValid = false
    } else if (trimmedName.length < 3) {
      setNameError('Problem name must be at least 3 characters')
      isValid = false
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      setNameError(`Problem name must be ${NAME_MAX_LENGTH} characters or less`)
      isValid = false
    }

    // Validate description
    const trimmedDescription = description.trim()
    if (!trimmedDescription) {
      setDescriptionError('Problem description is required')
      isValid = false
    } else if (trimmedDescription.length < 10) {
      setDescriptionError('Problem description must be at least 10 characters')
      isValid = false
    } else if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(`Problem description must be ${DESCRIPTION_MAX_LENGTH} characters or less`)
      isValid = false
    }

    return isValid
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const trimmedName = name.trim()
      const trimmedDescription = description.trim()
      
      const newProblem = await createProblem({
        name: trimmedName,
        description: trimmedDescription
      })

      // Call success callback and close modal
      onSuccess(newProblem.name)
      onClose()
    } catch (error) {
      showError(`Failed to create problem: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }

  /**
   * Handle closing the modal
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  /**
   * Handle escape key
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      onClose()
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
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Problem
              </h3>
              {!isSubmitting && (
                <motion.button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Modal Body */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="p-6"
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="space-y-4">
                {/* Problem Name Field */}
                <motion.div variants={fieldVariants}>
                  <label className="form-label">
                    Problem Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`form-input ${nameError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="e.g., Two Sum"
                    maxLength={NAME_MAX_LENGTH}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-1">
                    {nameError ? (
                      <span className="text-red-600 text-sm">{nameError}</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Minimum 3 characters</span>
                    )}
                    <span className={`text-xs ${name.length > NAME_MAX_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                      {name.length}/{NAME_MAX_LENGTH}
                    </span>
                  </div>
                </motion.div>

                {/* Problem Description Field */}
                <motion.div variants={fieldVariants}>
                  <label className="form-label">
                    Problem Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`form-textarea ${descriptionError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Describe the problem, approach, or key insights..."
                    rows={4}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {descriptionError ? (
                      <span className="text-red-600 text-sm">{descriptionError}</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Minimum 10 characters</span>
                    )}
                    <span className={`text-xs ${description.length > DESCRIPTION_MAX_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                      {description.length}/{DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Form Actions */}
              <motion.div 
                className="flex space-x-3 pt-6"
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
                  disabled={isSubmitting || !name.trim() || !description.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  whileHover={!isSubmitting && name.trim() && description.trim() ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting && name.trim() && description.trim() ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating...
                    </>
                  ) : (
                    'Create Problem'
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProblemFormModal 