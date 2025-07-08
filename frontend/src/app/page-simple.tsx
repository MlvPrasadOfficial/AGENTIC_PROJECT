/**
 * File: page-simple.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Simple test page to verify UnifiedLayout without Suspense wrappers
 * 
 * This component provides a simplified version of the home page for testing
 * the unified layout structure without complex state management or dynamic loading.
 * Used for debugging layout issues and verifying glassmorphism effects.
 * 
 * Layout Structure:
 * - Header: Navigation with glassmorphism
 * - Left Column (40%): Simple upload and chat test components
 * - Right Column (60%): Agent workflow test
 * - Dashboard: Full-width visualization test area
 */

'use client';

import { UnifiedLayout } from '@/components/layout/unified-layout';
import { Header } from '@/components/navigation/header';

/**
 * SimpleHomePage Component
 * 
 * A streamlined version of the main home page used for:
 * - Layout testing and debugging
 * - Glassmorphism effect verification
 * - Component isolation testing
 * - Performance baseline comparison
 * 
 * @returns {JSX.Element} The simple home page layout
 */
export default function SimpleHomePage() {
  return (
    <UnifiedLayout
      header={<Header />}
      leftColumn={
        <div className="space-y-6">
          {/* Simple Upload Test */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                📤
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Upload your Data</h2>
                <p className="text-sm text-gray-400">Test upload section</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
              <p className="text-white">Drag and drop files here</p>
            </div>
          </div>
          
          {/* Simple Chat Test */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                💬
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Ask Copilot</h2>
                <p className="text-sm text-gray-400">Test chat section</p>
              </div>
            </div>
            <div className="border border-gray-600 rounded-lg p-4">
              <input 
                type="text" 
                placeholder="Type your query..." 
                className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
              />
            </div>
          </div>
        </div>
      }
      rightColumn={
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              🔄
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Agent Workflow</h2>
              <p className="text-sm text-gray-400">Test agent pipeline</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
              <span className="text-white">📊 Data Agent</span>
              <span className="text-gray-400">⚪ Idle</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
              <span className="text-white">🧹 Cleaner Agent</span>
              <span className="text-gray-400">⚪ Waiting</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
              <span className="text-white">🎯 Planning Agent</span>
              <span className="text-gray-400">⚪ Waiting</span>
            </div>
          </div>
        </div>
      }
      dashboard={
        <div className="glass-card p-6 m-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
              📊
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Visualization Dashboard</h2>
              <p className="text-sm text-gray-400">Test dashboard section</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-white">📊 Bar Chart</div>
            </div>
            <div className="border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-white">📈 Line Chart</div>
            </div>
            <div className="border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-white">🥧 Pie Chart</div>
            </div>
          </div>
        </div>
      }
    />
  );
}
