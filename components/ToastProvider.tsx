import React, { createContext, useContext } from 'react'
import { Toaster, toast } from 'react-hot-toast'

/**
 * Toast notification types for consistent styling
 */
export type ToastType = 'success' | 'error' | 'loading' | 'info'

/**
 * Toast context interface
 */
interface ToastContextType {
  showToast: (type: ToastType, message: string, options?: any) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showLoading: (message: string) => string
  showInfo: (message: string) => void
  dismissToast: (toastId: string) => void
}

/**
 * Toast context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Custom hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * Toast Provider component
 * Provides toast notification functionality throughout the app
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * Generic toast function
   */
  const showToast = (type: ToastType, message: string, options = {}) => {
    const defaultOptions = {
      duration: 4000,
      position: 'top-right' as const,
      ...options
    }

    switch (type) {
      case 'success':
        return toast.success(message, {
          ...defaultOptions,
          icon: '✅',
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        })
      case 'error':
        return toast.error(message, {
          ...defaultOptions,
          icon: '❌',
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        })
      case 'loading':
        return toast.loading(message, {
          ...defaultOptions,
          icon: '⏳',
          style: {
            background: '#fffbeb',
            color: '#92400e',
            border: '1px solid #fef3c7',
          },
        })
      case 'info':
        return toast(message, {
          ...defaultOptions,
          icon: 'ℹ️',
          style: {
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #dbeafe',
          },
        })
      default:
        return toast(message, defaultOptions)
    }
  }

  /**
   * Convenience methods for different toast types
   */
  const showSuccess = (message: string) => showToast('success', message)
  const showError = (message: string) => showToast('error', message)
  const showLoading = (message: string) => showToast('loading', message)
  const showInfo = (message: string) => showToast('info', message)

  /**
   * Dismiss a specific toast
   */
  const dismissToast = (toastId: string) => {
    toast.dismiss(toastId)
  }

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showLoading,
    showInfo,
    dismissToast,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          // Individual toast type options
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#fff',
            },
          },
        }}
      />
    </ToastContext.Provider>
  )
} 