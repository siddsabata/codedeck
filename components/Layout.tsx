import React from 'react'
import Head from 'next/head'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

/**
 * Basic layout component for codedeck app
 * Provides consistent header, main content area, and footer across all pages
 */
const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'codedeck - LeetCode Flashcards',
  description = 'A personal app for managing LeetCode problems as flashcards'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            <p>codedeck © {new Date().getFullYear()} Siddharth Sabata</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Layout 