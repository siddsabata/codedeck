import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Problem } from '../lib/types'
import { deleteProblem } from '../hooks/useProblems'
import { useToast } from './ToastProvider'
import DeleteConfirmModal from './DeleteConfirmModal'

interface ProblemCardProps {
  problem: Problem
  index?: number // For staggered animations
}

/**
 * ProblemCard component with smooth animations and toast notifications
 * Displays problem information in a card format with hover effects and actions
 */
const ProblemCard: React.FC<ProblemCardProps> = ({ problem, index = 0 }) => {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  
  // State for dropdown and delete functionality
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate last attempt date
  const lastAttemptDate = problem.attempts.length > 0 
    ? new Date(problem.attempts[0].timestamp).toLocaleDateString()
    : null

  // Handle card click navigation
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown or its children
    if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
      return
    }
    // Prefetch the route for faster navigation
    router.prefetch(`/problems/${problem.id}`)
    router.push(`/problems/${problem.id}`)
  }

  // Prefetch the problem route on hover for even faster navigation
  const handleCardHover = () => {
    router.prefetch(`/problems/${problem.id}`)
  }

  // Handle dropdown toggle
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(false)
    setIsDeleteModalOpen(true)
  }

  // Handle closing delete modal
  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (isDeleting) return

    setIsDeleting(true)

    try {
      await deleteProblem(problem.id)
      showSuccess(`"${problem.name}" has been deleted successfully`)
      setIsDeleteModalOpen(false)
    } catch (error) {
      showError(`Failed to delete "${problem.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsDeleting(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.1, // Staggered animation
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  }

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15
      }
    }
  }

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        layout
        onClick={handleCardClick}
        onMouseEnter={handleCardHover}
        className={`
          relative bg-white rounded-lg card-shadow p-6 cursor-pointer border-l-4
          ${problem.solved 
            ? 'border-l-success-500 bg-success-50' 
            : 'border-l-primary-500'
          }
        `}
      >
        {/* Header with title and solved badge */}
        <div className="flex items-start justify-between mb-3">
          <motion.h3 
            className={`
              text-lg font-semibold leading-tight flex-1 mr-3
              ${problem.solved ? 'text-success-800' : 'text-gray-900'}
            `}
            layout
          >
            {problem.name}
          </motion.h3>
          
          <div className="flex items-center space-x-2">
            {/* Solved status badge */}
            <motion.span 
              className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${problem.solved 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-warning-100 text-warning-800'
                }
              `}
              layout
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {problem.solved ? '✅ Solved' : '⏳ Unsolved'}
            </motion.span>

            {/* Dropdown menu */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={handleDropdownToggle}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="More options"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </motion.button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  >
                    <motion.button
                      onClick={handleDeleteClick}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                      whileHover={{ backgroundColor: "#fef2f2" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Description */}
        <motion.p 
          className="text-gray-600 text-sm mb-4 line-clamp-2"
          layout
        >
          {problem.description}
        </motion.p>

        {/* Stats */}
        <motion.div 
          className="flex items-center justify-between text-xs text-gray-500"
          layout
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {problem.attempts.length} attempt{problem.attempts.length !== 1 ? 's' : ''}
          </span>
          
          {lastAttemptDate && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last: {lastAttemptDate}
            </span>
          )}
        </motion.div>

        {/* Trick summary preview if available */}
        {problem.trickSummary && (
          <motion.div 
            className="mt-3 pt-3 border-t border-gray-100"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-gray-600 italic">
              💡 {problem.trickSummary.length > 60 
                ? `${problem.trickSummary.substring(0, 60)}...` 
                : problem.trickSummary
              }
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        problem={problem}
        isDeleting={isDeleting}
      />
    </>
  )
}

export default ProblemCard 