import React, { useState, useCallback } from 'react'
import { useAttemptCode } from '../hooks/useAttemptCode'

interface AttemptCodeModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to close the modal */
  onClose: () => void
  /** The attempt ID to display code for */
  attemptId: number | null
}

/**
 * Modal component for viewing attempt code
 * Displays Python code with basic formatting and copy functionality
 */
const AttemptCodeModal: React.FC<AttemptCodeModalProps> = ({
  isOpen,
  onClose,
  attemptId
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle')
  
  // Fetch attempt code using the custom hook
  const { code, filePath, attempt, problem, isLoading, isError, error } = useAttemptCode(
    attemptId,
    isOpen // Only fetch when modal is open
  )

  // Handle copy to clipboard
  const handleCopyCode = async () => {
    if (!code) return
    
    setCopyStatus('copying')
    
    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus('success')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  // Handle modal close
  const handleClose = useCallback(() => {
    setCopyStatus('idle')
    onClose()
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  // Don't render anything if modal is not open
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              View Attempt Code
            </h2>
            {attempt && problem && (
              <p className="text-sm text-gray-600 mt-1">
                {problem.name} - Attempt #{attempt.id}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading code...</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Code</h3>
                <p className="text-red-600 mb-4">
                  {error || 'Unable to load the code for this attempt.'}
                </p>
                <button
                  onClick={handleClose}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {code && (
            <>
              {/* Code Header with File Info and Copy Button */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <code className="text-gray-800">{filePath}</code>
                </div>
                
                <button
                  onClick={handleCopyCode}
                  disabled={copyStatus === 'copying'}
                  className={`
                    inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200
                    ${copyStatus === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : copyStatus === 'error'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {copyStatus === 'copying' && (
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b border-current mr-2"></div>
                  )}
                  {copyStatus === 'success' && (
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {copyStatus === 'error' && (
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {copyStatus === 'idle' && (
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                  {copyStatus === 'copying' ? 'Copying...' : 
                   copyStatus === 'success' ? 'Copied!' : 
                   copyStatus === 'error' ? 'Failed' : 'Copy Code'}
                </button>
              </div>

              {/* Code Display */}
              <div className="flex-1 overflow-auto">
                <pre className="p-4 text-sm leading-relaxed">
                  <code className="language-python text-gray-800 whitespace-pre-wrap font-mono">
                    {code}
                  </code>
                </pre>
              </div>

              {/* Attempt Metadata */}
              {attempt && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <p className="text-gray-600">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Commit:</span>
                      <p className="text-gray-600 font-mono">
                        {attempt.commitHash.substring(0, 8)}
                      </p>
                    </div>
                    {attempt.note && (
                      <div>
                        <span className="font-medium text-gray-700">Note:</span>
                        <p className="text-gray-600">
                          {attempt.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttemptCodeModal 