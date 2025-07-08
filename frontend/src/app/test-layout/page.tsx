/**
 * File: test-layout/page.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Layout testing page for debugging 2-column glassmorphism grid
 * 
 * This component is specifically designed for testing and debugging:
 * - 2-column grid layout (40%/60% split using Tailwind grid-cols-5)
 * - Glassmorphism effects and backdrop blur
 * - Responsive behavior and breakpoint transitions
 * - Visual spacing and proportions
 * 
 * Test Cases:
 * - Left column should occupy exactly 40% width (2/5 columns)
 * - Right column should occupy exactly 60% width (3/5 columns)
 * - Glass cards should have proper backdrop blur and transparency
 * - Layout should be responsive on mobile devices
 */

'use client';

/**
 * TestLayoutPage Component
 * 
 * Isolated layout testing component for debugging the core grid structure
 * without the complexity of feature components. Provides visual indicators
 * and measurements for layout verification.
 * 
 * @returns {JSX.Element} The layout testing interface
 */
export default function TestLayoutPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <h1 className="text-white text-2xl mb-8">Layout Test - 2 Column Glass</h1>
      
      {/* Force large screen behavior for testing */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Left Column (40% = 2/5 columns) */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 h-96">
              <h2 className="text-white text-xl mb-4">Left Column (40%)</h2>
              <p className="text-gray-400">This should be 2 out of 5 columns</p>
              <div className="mt-4 p-4 bg-blue-500/20 rounded">
                <p className="text-blue-300">Glass Card 1</p>
              </div>
            </div>
          </div>
          
          {/* Right Column (60% = 3/5 columns) */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6 h-96">
              <h2 className="text-white text-xl mb-4">Right Column (60%)</h2>
              <p className="text-gray-400">This should be 3 out of 5 columns</p>
              <div className="mt-4 p-4 bg-green-500/20 rounded">
                <p className="text-green-300">Glass Card 2</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Force show at medium size too */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-white">Force 2-col test</h3>
            <p className="text-gray-400">Left side</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-white">Force 2-col test</h3>
            <p className="text-gray-400">Right side</p>
          </div>
        </div>
      </div>
      

    </div>
  );
}
