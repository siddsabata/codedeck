import { NextPage } from 'next'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import ProblemCard from '../components/ProblemCard'
import ProblemFormModal from '../components/ProblemFormModal'
import { useProblems } from '../hooks/useProblems'
import { useToast } from '../components/ToastProvider'

/**
 * HomePage component - Main problem list page with animations
 * Displays all problems as cards, sorted by solved status and last update
 * Unsolved problems appear first, then sorted by oldest updatedAt
 */
const HomePage: NextPage = () => {
  const { problems, count, isLoading, isError, error } = useProblems()
  const { showSuccess } = useToast()
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  /**
   * Handle opening the modal
   */
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  /**
   * Handle closing the modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  /**
   * Handle successful problem creation
   */
  const handleProblemCreated = (problemName: string) => {
    showSuccess(`"${problemName}" has been created successfully!`)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <Layout 
      title="codedeck - LeetCode Flashcards"
      description="A personal app for managing LeetCode problems as flashcards"
    >
      <motion.div 
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            codedeck 🃏
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personal LeetCode problems flashcard manager with Git integration
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          className="bg-white rounded-lg card-shadow p-6 mb-8"
          variants={statsVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold text-primary-600">{count}</div>
              <div className="text-sm text-gray-600">Total Problems</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold text-success-600">
                {problems.filter(p => p.solved).length}
              </div>
              <div className="text-sm text-gray-600">Solved</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold text-warning-600">
                {problems.filter(p => !p.solved).length}
              </div>
              <div className="text-sm text-gray-600">Unsolved</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div 
          className="flex justify-between items-center mb-6"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-900">
            Problems
          </h2>
          <motion.button 
            onClick={handleOpenModal}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Problem
          </motion.button>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-gray-600">Loading problems...</p>
            </motion.div>
          )}

          {/* Error State */}
          {isError && (
            <motion.div 
              className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-red-600 mb-2">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Problems</h3>
              <p className="text-red-600 mb-4">
                {error?.message || 'Failed to load problems. Please try again.'}
              </p>
              <motion.button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && problems.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="text-gray-400 mb-4"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Problems Yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first LeetCode problem to track your progress.
              </p>
              <motion.button 
                onClick={handleOpenModal}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Your First Problem
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Problems Grid */}
        {!isLoading && !isError && problems.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {problems.map((problem, index) => (
                <ProblemCard 
                  key={problem.id} 
                  problem={problem} 
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer Info */}
        {!isLoading && !isError && problems.length > 0 && (
          <motion.div 
            className="mt-8 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <p>
              Showing {problems.length} problem{problems.length !== 1 ? 's' : ''} • 
              Sorted by unsolved first, then by oldest update
            </p>
          </motion.div>
        )}

        {/* Problem Form Modal */}
        <ProblemFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleProblemCreated}
        />
      </motion.div>
    </Layout>
  )
}

export default HomePage 