import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../../components/Layout'
import { useProblem } from '../../hooks/useProblem'
import { updateProblem, toggleProblemSolved, deleteProblem } from '../../hooks/useProblems'
import AttemptModal from '../../components/AttemptModal'
import AttemptItem from '../../components/AttemptItem'
import AttemptCodeModal from '../../components/AttemptCodeModal'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import { useAttempts } from '../../hooks/useAttempts'
import { useToast } from '../../components/ToastProvider'

/**
 * Inline editable text area component with word limit enforcement
 */
interface EditableTextAreaProps {
  value: string | null
  placeholder: string
  onSave: (value: string | null) => Promise<void>
  maxWords?: number
  label: string
  className?: string
}

const EditableTextArea: React.FC<EditableTextAreaProps> = ({
  value,
  placeholder,
  onSave,
  maxWords,
  label,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // Word count calculation
  const wordCount = editValue.trim() === '' ? 0 : editValue.trim().split(/\s+/).length
  const isOverLimit = maxWords ? wordCount > maxWords : false

  // Handle starting edit mode
  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value || '')
    setError(null)
    setIsCancelling(false)
  }

  // Handle canceling edit - use onMouseDown to fire before onBlur
  const handleCancelMouseDown = () => {
    setIsCancelling(true)
  }

  // Handle canceling edit - actual cancel logic
  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value || '')
    setError(null)
    setIsCancelling(false)
  }

  // Handle saving changes
  const handleSave = async () => {
    if (isOverLimit) {
      setError(`${label} cannot exceed ${maxWords} words`)
      return
    }
    
    if (isCancelling) { // Don't save if cancelling
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const trimmedValue = editValue.trim()
      await onSave(trimmedValue === '' ? null : trimmedValue)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle blur (save on blur only if not cancelling)
  const handleBlur = (e: React.FocusEvent) => {
    // Don't save if we're clicking the cancel button or if over word limit
    if (!isOverLimit && !isCancelling) {
      // Small delay to allow cancel button click to register
      setTimeout(() => {
        if (!isCancelling) {
          handleSave()
        }
      }, 100)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCancelling(true)
      handleCancel()
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  // Auto-focus and resize textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [isEditing])

  if (isEditing) {
    return (
      <div className={className}>
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              ${isOverLimit ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            rows={3}
            disabled={isSaving}
          />
          
          {/* Word count and controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              {maxWords && (
                <span className={isOverLimit ? 'text-red-600' : 'text-gray-500'}>
                  {wordCount}/{maxWords} words
                </span>
              )}
              {error && (
                <span className="text-red-600">{error}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                ref={cancelButtonRef}
                onMouseDown={handleCancelMouseDown}
                onClick={handleCancel}
                disabled={isSaving}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isOverLimit}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Tip: Press Escape to cancel, or Ctrl+Enter to save
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleEdit}
      className={`
        cursor-pointer p-3 rounded-lg border-2 border-dashed border-gray-200 
        hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200
        ${className}
      `}
    >
      {value ? (
        <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-gray-500 italic">{placeholder}</p>
      )}
      <p className="text-xs text-gray-400 mt-1">Click to edit</p>
    </div>
  )
}

/**
 * Problem Detail Page with full inline editing capabilities and animations
 */
const ProblemDetailPage: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  
  // Only parse problem ID when router is ready and ID is available
  const problemId = router.isReady && typeof id === 'string' ? parseInt(id, 10) : null
  const { showSuccess, showError } = useToast()

  const { problem, isLoading, isError, error, revalidate } = useProblem(problemId)
  const { attempts, isLoading: attemptsLoading, revalidate: revalidateAttempts } = useAttempts(problemId)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false)

  // Code viewing modal state
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Add state to control animation timing
  const [shouldAnimate, setShouldAnimate] = useState(false)

  // Effect to enable animations after content is rendered
  useEffect(() => {
    if (problem) {
      // Small delay to ensure content is rendered first
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [problem])

  // Animation variants - only animate if shouldAnimate is true
  const pageVariants = {
    hidden: { opacity: shouldAnimate ? 0 : 1, y: shouldAnimate ? 20 : 0 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: shouldAnimate ? 0.4 : 0,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: shouldAnimate ? 0 : 1, scale: shouldAnimate ? 0.95 : 1 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: shouldAnimate ? 0.3 : 0,
        delay: shouldAnimate ? 0.1 : 0
      }
    }
  }

  // Show loading state while router is not ready or while data is loading
  if (!router.isReady || !problemId || isLoading) {
    return (
      <Layout title="Loading..." description="Loading problem details">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center py-12">
            <motion.div 
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-gray-600">
              {!router.isReady ? 'Initializing...' : 'Loading problem details...'}
            </p>
          </div>
        </motion.div>
      </Layout>
    )
  }

  // Error state
  if (isError || !problem) {
    return (
      <Layout title="Problem Not Found" description="Problem could not be loaded">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Problem Not Found</h3>
            <p className="text-red-600 mb-4">
              {error?.message || 'The requested problem could not be found.'}
            </p>
            <motion.button 
              onClick={() => router.push('/')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Problems
            </motion.button>
          </div>
        </motion.div>
      </Layout>
    )
  }

  // Handle solved status toggle
  const handleToggleSolved = async () => {
    if (!problem || isTogglingStatus) return

    setIsTogglingStatus(true)

    try {
      await toggleProblemSolved(problem.id, !problem.solved)
      showSuccess(`Problem marked as ${!problem.solved ? 'solved' : 'unsolved'}!`)
    } catch (error) {
      showError(`Failed to update solved status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  // Handle saving trick summary
  const handleSaveTrickSummary = async (value: string | null) => {
    if (!problem) return
    
    try {
      await updateProblem(problem.id, { trickSummary: value })
      showSuccess('Trick summary updated successfully!')
    } catch (error) {
      showError(`Failed to update trick summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error // Re-throw to let EditableTextArea handle the error state
    }
  }

  // Handle saving notes
  const handleSaveNotes = async (value: string | null) => {
    if (!problem) return
    
    try {
      await updateProblem(problem.id, { notes: value })
      showSuccess('Notes updated successfully!')
    } catch (error) {
      showError(`Failed to update notes: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error // Re-throw to let EditableTextArea handle the error state
    }
  }

  // Handle opening attempt modal
  const handleOpenAttemptModal = () => {
    setIsAttemptModalOpen(true)
  }

  // Handle closing attempt modal
  const handleCloseAttemptModal = () => {
    setIsAttemptModalOpen(false)
  }

  // Handle viewing attempt code
  const handleViewCode = (attemptId: number) => {
    setSelectedAttemptId(attemptId)
    setIsCodeModalOpen(true)
  }

  // Handle closing code modal
  const handleCloseCodeModal = () => {
    setIsCodeModalOpen(false)
    setSelectedAttemptId(null)
  }

  // Handle successful attempt creation
  const handleAttemptSuccess = (commitHash: string) => {
    showSuccess(`Attempt created successfully! Commit: ${commitHash.substring(0, 8)}`)
    // Revalidate both problem and attempts data
    revalidate()
    revalidateAttempts()
  }

  // Handle opening delete modal
  const handleOpenDeleteModal = () => {
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
    if (!problem || isDeleting) return

    setIsDeleting(true)

    try {
      await deleteProblem(problem.id)
      showSuccess(`"${problem.name}" has been deleted successfully`)
      // Navigate back to home page after successful deletion
      router.push('/')
    } catch (error) {
      showError(`Failed to delete "${problem.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsDeleting(false)
    }
  }

  return (
    <Layout 
      title={`${problem.name} - codedeck`} 
      description={problem.description}
    >
      <motion.div 
        className="max-w-4xl mx-auto"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        key={problem.id}
      >
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <motion.button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mr-4"
            whileHover={shouldAnimate ? { x: -5 } : {}}
            whileTap={shouldAnimate ? { scale: 0.95 } : {}}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Problems
          </motion.button>
        </div>

        {/* Problem Details Card */}
        <motion.div 
          className="bg-white rounded-lg card-shadow p-8"
          variants={cardVariants}
          key={`problem-card-${problem.id}`}
        >
          {/* Problem Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {problem.name}
              </h1>
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={handleToggleSolved}
                  disabled={isTogglingStatus}
                  className={`
                    inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${problem.solved 
                      ? 'bg-success-100 text-success-800 hover:bg-success-200' 
                      : 'bg-warning-100 text-warning-800 hover:bg-warning-200'
                    }
                  `}
                  whileHover={shouldAnimate && !isTogglingStatus ? { scale: 1.05 } : {}}
                  whileTap={shouldAnimate && !isTogglingStatus ? { scale: 0.95 } : {}}
                >
                  {isTogglingStatus ? (
                    <motion.div 
                      className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
                      animate={shouldAnimate ? { rotate: 360 } : {}}
                      transition={shouldAnimate ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                    />
                  ) : (
                    <span className="mr-2">{problem.solved ? '✅' : '⏳'}</span>
                  )}
                  {problem.solved ? 'Solved' : 'Unsolved'}
                  <span className="ml-2 text-xs opacity-75">Click to toggle</span>
                </motion.button>
                <span className="text-sm text-gray-500">
                  {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleOpenDeleteModal}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete Problem"
                whileHover={shouldAnimate ? { scale: 1.1 } : {}}
                whileTap={shouldAnimate ? { scale: 0.9 } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Problem Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                {problem.description}
              </p>
            </div>
          </div>

          {/* Trick Summary - Inline Editable */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              💡 Trick Summary
              <span className="text-sm font-normal text-gray-500 ml-2">(max 50 words)</span>
            </h2>
            <EditableTextArea
              value={problem.trickSummary}
              placeholder="Click to add a trick summary... Keep it concise and focused on the key insight or pattern for solving this problem."
              onSave={handleSaveTrickSummary}
              maxWords={50}
              label="Trick Summary"
              className="bg-yellow-50 border border-yellow-200 rounded-lg"
            />
          </div>

          {/* Notes - Inline Editable */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">📝 Notes</h2>
            <EditableTextArea
              value={problem.notes}
              placeholder="Click to add your notes... Include any additional insights, edge cases, or reminders for solving this problem."
              onSave={handleSaveNotes}
              label="Notes"
              className="bg-gray-50 border border-gray-200 rounded-lg"
            />
          </div>

          {/* Attempts Section - Now with full functionality */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🔄 Attempts</h2>
              <button
                onClick={handleOpenAttemptModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Attempt
              </button>
            </div>
            
            {/* Attempts List */}
            {attemptsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading attempts...</p>
              </div>
            ) : attempts.length > 0 ? (
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <AttemptItem
                    key={attempt.id}
                    attempt={attempt}
                    repoUrl={process.env.NEXT_PUBLIC_GITHUB_REPO_URL}
                    onViewCode={handleViewCode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-gray-500 mb-2">No attempts yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Click &ldquo;Add Attempt&rdquo; to record your first coding attempt
                </p>
                <button
                  onClick={handleOpenAttemptModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Add Your First Attempt
                </button>
              </div>
            )}
          </div>

          {/* Problem metadata */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(problem.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(problem.updatedAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Problem ID:</span> #{problem.id}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Attempt Modal */}
      <AttemptModal
        isOpen={isAttemptModalOpen}
        onClose={handleCloseAttemptModal}
        problemId={problem.id}
        problemName={problem.name}
        onSuccess={handleAttemptSuccess}
      />

      {/* Attempt Code Modal */}
      <AttemptCodeModal
        isOpen={isCodeModalOpen}
        onClose={handleCloseCodeModal}
        attemptId={selectedAttemptId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        problem={problem}
        isDeleting={isDeleting}
      />
    </Layout>
  )
}

export default ProblemDetailPage 