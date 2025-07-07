/**
 * File: page.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Home page component implementing unified 3-section layout from 10-frontend-home-ui-layout.txt
 */

'use client';

import { UnifiedLayout } from '@/components/layout/unified-layout';
import { Header } from '@/components/navigation/header';

/**
 * Home Page Component - Clean Implementation
 * Implements the unified 3-section layout with proper glassmorphism
 */
export default function HomePage() {
  return (
    <UnifiedLayout
      header={<Header />}
      leftColumn={
        <div className="w-full space-y-6">
          {/* Glass Card 1 - Upload Section */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                📤
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Upload your Data</h2>
                <p className="text-sm text-gray-400">Drag and drop files or click to browse</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
              <p className="text-white mb-2">Drag and drop a file here,</p>
              <p className="text-white mb-2">or click to browse</p>
              <button className="glass-button-primary mt-4 px-4 py-2">📎 Browse Files</button>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-400">ℹ️ CSV, XLSX, JSON files supported</p>
              <div className="flex items-center justify-between bg-gray-800/40 rounded-lg p-2">
                <span className="text-sm text-gray-300">📊 Preview: sample-data.csv</span>
                <button className="text-red-400 hover:text-red-300">❌</button>
              </div>
            </div>
          </div>
          
          {/* Glass Card 2 - Chat Section */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                💬
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Ask Copilot</h2>
                <p className="text-sm text-gray-400">Natural language analytics queries</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-600 rounded-lg p-4 bg-white/5">
                <textarea 
                  placeholder="Type your analytics query..." 
                  className="w-full bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none"
                  rows={3}
                />
              </div>
              <div className="text-right">
                <button className="glass-button-primary px-4 py-2">Send 📤</button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-300">💡 Suggestions:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• "Show me sales trends by region"</li>
                <li>• "What are the top performing products?"</li>
                <li>• "Generate quarterly revenue report"</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-300">📜 Chat History: [3 conversations]</p>
                <p className="text-sm text-gray-300">📄 Reports Ready: [Q3-Analysis.pdf]</p>
              </div>
            </div>
          </div>
        </div>
      }
      rightColumn={
        <div className="w-full">
          {/* Glass Card 3 - Agent Workflow */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                🔄
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Agent Workflow</h2>
                <p className="text-sm text-gray-400">11-agent pipeline for data analysis</p>
              </div>
            </div>
            
            {/* Agent Pipeline - 2 Column Layout */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column Agents */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">📊 Data Agent</span>
                      <div className="text-xs text-gray-400">Status: Ready</div>
                    </div>
                    <span className="text-gray-400">⚪ Idle</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">🧹 Cleaner Agent</span>
                      <div className="text-xs text-gray-400">Awaiting Data Agent</div>
                    </div>
                    <span className="text-gray-400">⚪ Waiting</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">🎯 Planning Agent</span>
                      <div className="text-xs text-gray-400">Queue Position #3</div>
                    </div>
                    <span className="text-gray-400">⚪ Waiting</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">❓ Query Agent</span>
                      <div className="text-xs text-gray-400">Ready for Queries</div>
                    </div>
                    <span className="text-gray-400">⚪ Idle</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">🤝 Debate Agent</span>
                      <div className="text-xs text-gray-400">Multi-perspective Ready</div>
                    </div>
                    <span className="text-gray-400">⚪ Idle</span>
                  </div>
                </div>
                
                {/* Right Column Agents */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">🗄️ SQL Agent</span>
                      <div className="text-xs text-green-400">DB Connected</div>
                    </div>
                    <span className="text-green-400">🟢 Ready</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">💡 Insight Agent</span>
                      <div className="text-xs text-gray-400">LLM Model Ready 🧠</div>
                    </div>
                    <span className="text-gray-400">⚪ Idle</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">📈 Chart Agent</span>
                      <div className="text-xs text-gray-400">D3.js Library Ready</div>
                    </div>
                    <span className="text-gray-400">⚪ Idle</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">⚖️ Critique Agent</span>
                      <div className="text-xs text-gray-400">Quality Checks Ready</div>
                    </div>
                    <span className="text-gray-400">⚪ Idle</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                    <div>
                      <span className="text-white">📄 Narrative Agent</span>
                      <div className="text-xs text-gray-400">Story Generation Ready</div>
                    </div>
                    <span className="text-gray-400">⚪ Idle</span>
                  </div>
                </div>
              </div>
              
              {/* Report Agent (Full Width) */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/20">
                  <div>
                    <span className="text-white">📋 Report Agent</span>
                    <div className="text-xs text-gray-400">Export Templates Ready</div>
                  </div>
                  <span className="text-gray-400">⚪ Idle</span>
                </div>
              </div>
              
              {/* Pipeline Controls */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-white">🔄 Pipeline Status: Ready</span>
                    <div className="text-xs text-gray-400">📊 Progress: ▓░░░░░░░░░ 0% (0/11 complete)</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="glass-button-primary px-3 py-2 text-sm">▶️ Start Pipeline</button>
                  <button className="glass-button-secondary px-3 py-2 text-sm">⏸️ Pause</button>
                  <button className="glass-button-secondary px-3 py-2 text-sm">🔄 Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      dashboard={
        <div className="glass-card m-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                📊
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Full-Width Visualization Dashboard</h2>
                <p className="text-sm text-gray-400">Interactive charts and analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="glass-button-secondary px-3 py-1 text-xs">📊 Charts</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">📈 Analytics</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">📋 Reports</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">🔍 Search</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">📤 Export</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="border border-gray-700 rounded-lg p-6 text-center bg-gray-800/20">
              <div className="text-3xl mb-3">📊</div>
              <div className="text-white font-medium mb-1">Bar Chart</div>
              <div className="text-gray-400 text-sm mb-3">Sales Data</div>
              <div className="text-xs text-gray-500 mb-3">███████████████████</div>
              <div className="flex gap-1 justify-center">
                <button className="glass-button-secondary px-2 py-1 text-xs">📋</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">⚙️</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">📤</button>
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg p-6 text-center bg-gray-800/20">
              <div className="text-3xl mb-3">📈</div>
              <div className="text-white font-medium mb-1">Line Chart</div>
              <div className="text-gray-400 text-sm mb-3">Trends</div>
              <div className="text-xs text-gray-500 mb-3">/\  /\  /\</div>
              <div className="flex gap-1 justify-center">
                <button className="glass-button-secondary px-2 py-1 text-xs">📋</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">⚙️</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">📤</button>
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg p-6 text-center bg-gray-800/20">
              <div className="text-3xl mb-3">🥧</div>
              <div className="text-white font-medium mb-1">Pie Chart</div>
              <div className="text-gray-400 text-sm mb-3">Distribution</div>
              <div className="text-xs text-gray-500 mb-3">●●●●●●●●</div>
              <div className="flex gap-1 justify-center">
                <button className="glass-button-secondary px-2 py-1 text-xs">📋</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">⚙️</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">📤</button>
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg p-6 text-center bg-gray-800/20">
              <div className="text-3xl mb-3">📉</div>
              <div className="text-white font-medium mb-1">Trend Chart</div>
              <div className="text-gray-400 text-sm mb-3">Performance</div>
              <div className="text-xs text-gray-500 mb-3">↗️↗️↗️↗️↗️</div>
              <div className="flex gap-1 justify-center">
                <button className="glass-button-secondary px-2 py-1 text-xs">📋</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">⚙️</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">📤</button>
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg p-6 text-center bg-gray-800/20">
              <div className="text-3xl mb-3">📋</div>
              <div className="text-white font-medium mb-1">Data Table</div>
              <div className="text-gray-400 text-sm mb-3">Raw Data</div>
              <div className="text-xs text-gray-500 mb-3 font-mono">
                <div>Laptop  150  $75K</div>
                <div>Phone   300  $90K</div>
              </div>
              <div className="flex gap-1 justify-center">
                <button className="glass-button-secondary px-2 py-1 text-xs">📋</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">⚙️</button>
                <button className="glass-button-secondary px-2 py-1 text-xs">📤</button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-300">📊 Live Data: Updating every 30s</span>
              <span className="text-gray-300">🎯 KPIs: Revenue ↑12%, Users ↑8%</span>
              <span className="text-yellow-400">⚠️ Alerts: 2 notifications</span>
              <span className="text-green-400">🔄 Auto-refresh: ON</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="glass-button-secondary px-3 py-1 text-xs">📱 Mobile View</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">🖥️ Desktop View</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">📺 Fullscreen</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">🎨 Change Theme</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">📤 Share</button>
              <button className="glass-button-secondary px-3 py-1 text-xs">💾 Save Layout</button>
            </div>
          </div>
        </div>
      }
    />
  );
}
