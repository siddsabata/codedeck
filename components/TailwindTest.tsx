import React from 'react'

/**
 * Test component to verify Tailwind CSS utilities are working correctly
 * This component showcases various Tailwind classes and custom utilities
 */
const TailwindTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Tailwind CSS Test Components
      </h2>

      {/* Color Palette Test */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Color Palette</h3>
        <div className="flex space-x-2">
          <div className="w-16 h-16 bg-primary-50 rounded border flex items-center justify-center text-xs">50</div>
          <div className="w-16 h-16 bg-primary-500 rounded border flex items-center justify-center text-xs text-white">500</div>
          <div className="w-16 h-16 bg-primary-600 rounded border flex items-center justify-center text-xs text-white">600</div>
          <div className="w-16 h-16 bg-primary-700 rounded border flex items-center justify-center text-xs text-white">700</div>
        </div>
        <div className="flex space-x-2">
          <div className="w-16 h-16 bg-success-50 rounded border flex items-center justify-center text-xs">50</div>
          <div className="w-16 h-16 bg-success-500 rounded border flex items-center justify-center text-xs text-white">500</div>
          <div className="w-16 h-16 bg-success-600 rounded border flex items-center justify-center text-xs text-white">600</div>
        </div>
        <div className="flex space-x-2">
          <div className="w-16 h-16 bg-warning-50 rounded border flex items-center justify-center text-xs">50</div>
          <div className="w-16 h-16 bg-warning-500 rounded border flex items-center justify-center text-xs text-white">500</div>
          <div className="w-16 h-16 bg-warning-600 rounded border flex items-center justify-center text-xs text-white">600</div>
        </div>
      </div>

      {/* Button Test */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Button Classes</h3>
        <div className="flex space-x-2">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-success">Success Button</button>
          <button className="btn-warning">Warning Button</button>
        </div>
      </div>

      {/* Badge Test */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Status Badges</h3>
        <div className="flex space-x-2">
          <span className="badge-solved">✓ Solved</span>
          <span className="badge-unsolved">○ Unsolved</span>
        </div>
      </div>

      {/* Card Shadow Test */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Card Shadow Effects</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg card-shadow">
            <p>Hover over this card to see shadow transition</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p>Standard Tailwind shadow-lg</p>
          </div>
        </div>
      </div>

      {/* Form Elements Test */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Form Elements</h3>
        <div className="max-w-md space-y-4">
          <div>
            <label className="form-label">Test Input</label>
            <input type="text" className="form-input" placeholder="Type something..." />
          </div>
          <div>
            <label className="form-label">Test Textarea</label>
            <textarea className="form-textarea" rows={3} placeholder="Enter notes..."></textarea>
          </div>
        </div>
      </div>

      {/* Loading Spinner Test */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Loading Spinner</h3>
        <div className="flex items-center space-x-2">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default TailwindTest 