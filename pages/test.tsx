import { NextPage } from 'next'
import Layout from '../components/Layout'
import TailwindTest from '../components/TailwindTest'

/**
 * Test page to verify Tailwind CSS setup and custom utilities
 * This page will be removed once development is complete
 */
const TestPage: NextPage = () => {
  return (
    <Layout 
      title="Tailwind CSS Test - codedeck"
      description="Testing Tailwind CSS utilities and custom classes"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tailwind CSS Test Page
          </h1>
          <p className="text-gray-600">
            This page verifies that all Tailwind CSS utilities and custom classes are working correctly.
          </p>
        </div>

        <div className="bg-white rounded-lg card-shadow">
          <TailwindTest />
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            <strong>Note:</strong> This test page will be removed once development is complete. 
            You can access it at <code>/test</code> to verify Tailwind CSS is working properly.
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default TestPage 