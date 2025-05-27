import React from 'react'
import { Attempt } from '../lib/types'

interface AttemptItemProps {
  /** The attempt data to display */
  attempt: Attempt
  /** Optional GitHub repository URL for generating commit links */
  repoUrl?: string
  /** Whether to show the full commit hash (default: false, shows short hash) */
  showFullHash?: boolean
  /** Optional custom CSS classes */
  className?: string
  /** Callback when user wants to view the code for this attempt */
  onViewCode?: (attemptId: number) => void
}

/**
 * Component for displaying individual coding attempts
 * Shows timestamp, commit hash, note, and GitHub commit link
 */
const AttemptItem: React.FC<AttemptItemProps> = ({
  attempt,
  repoUrl,
  showFullHash = false,
  className = '',
  onViewCode
}) => {
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    // Show relative time for recent attempts
    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else if (diffInMinutes < 7 * 24 * 60) {
      const days = Math.floor(diffInMinutes / (24 * 60))
      return `${days}d ago`
    }
    
    // For older attempts, show full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Generate commit URL for GitHub
  const getCommitUrl = () => {
    if (!repoUrl || !attempt.commitHash) return null
    
    // Clean the repo URL and construct commit URL
    const cleanRepoUrl = repoUrl.replace(/\.git$/, '')
    return `${cleanRepoUrl}/commit/${attempt.commitHash}`
  }

  // Get displayed commit hash (short or full)
  const getDisplayHash = () => {
    if (!attempt.commitHash) return 'N/A'
    return showFullHash ? attempt.commitHash : attempt.commitHash.substring(0, 8)
  }

  // Handle view code button click
  const handleViewCode = () => {
    if (onViewCode && attempt.filePath) {
      onViewCode(attempt.id)
    }
  }

  const commitUrl = getCommitUrl()
  const displayHash = getDisplayHash()
  const formattedTime = formatTimestamp(attempt.timestamp)

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-200 ${className}`}>
      {/* Attempt Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Attempt icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          
          {/* Timestamp */}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formattedTime}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(attempt.timestamp).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Commit hash and link */}
        <div className="flex items-center space-x-2">
          {/* View Code Button - only show if file path exists and callback provided */}
          {attempt.filePath && onViewCode && (
            <button
              onClick={handleViewCode}
              className="inline-flex items-center px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded border transition-colors duration-200"
              title="View the Python code for this attempt"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              View Code
            </button>
          )}

          {commitUrl ? (
            <a
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono rounded border transition-colors duration-200"
              title={`View commit ${attempt.commitHash} on GitHub`}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {displayHash}
            </a>
          ) : (
            <span 
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded border"
              title={`Commit hash: ${attempt.commitHash}`}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {displayHash}
            </span>
          )}
        </div>
      </div>

      {/* Attempt Note */}
      {attempt.note && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {attempt.note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attempt Footer - Additional metadata */}
      <div className="mt-3 pt-2 border-t border-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Attempt #{attempt.id}</span>
            {attempt.filePath && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <code className="text-gray-600">{attempt.filePath}</code>
              </span>
            )}
          </div>
          {commitUrl && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1">View on GitHub</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttemptItem 