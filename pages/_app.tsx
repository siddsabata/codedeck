import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import '../styles/globals.css'
import { ToastProvider } from '../components/ToastProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        // Ensure immediate data fetching without waiting for focus
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        // Reduce deduping interval to allow fresh requests
        dedupingInterval: 1000,
        // Ensure data loads immediately on mount
        revalidateOnMount: true,
        // Faster error retry
        errorRetryInterval: 500,
        errorRetryCount: 2,
        // Prevent stale data issues
        refreshInterval: 0,
        // Ensure fetcher errors are handled properly
        shouldRetryOnError: true,
      }}
    >
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </SWRConfig>
  )
} 