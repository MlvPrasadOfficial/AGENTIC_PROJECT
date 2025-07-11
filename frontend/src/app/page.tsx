/**
 * File: page.tsx
 * Author:   });ot
 * Date: 2025-07-08
 * Purpose: Home page component with 2-column layout for Enterprise Insights Copilot
 */

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FileUpload } from '@/components/upload/FileUpload';
import fileService, { SampleData } from '@/lib/api/fileService';
import { Navbar } from '@/components/layout/Navbar';

export default function Page() {
  // State to store preview data
  const [previewData, setPreviewData] = useState<SampleData | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // State for agent workflow
  const [agentStates, setAgentStates] = useState<Record<string, {
    status: 'waiting' | 'processing' | 'completed' | 'ready';
    output: string;
    isExpanded: boolean;
  }>>({
    'file-upload': { status: 'waiting', output: '', isExpanded: false },
    'data-profile': { status: 'waiting', output: '', isExpanded: false },
    'planning': { status: 'waiting', output: '', isExpanded: false },
    'insight': { status: 'waiting', output: '', isExpanded: false },
    'viz': { status: 'waiting', output: '', isExpanded: false },
    'critique': { status: 'waiting', output: '', isExpanded: false },
    'debate': { status: 'waiting', output: '', isExpanded: false },
    'report': { status: 'waiting', output: '', isExpanded: false }
  });
  
  // Function to handle file upload completion
  const handleFileUploaded = async (fileId: string) => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    
    // Start the agent workflow
    setAgentStates(prev => ({
      ...prev,
      'file-upload': { 
        status: 'completed', 
        output: 'File successfully uploaded and validated. Ready for processing.',
        isExpanded: true 
      }
    }));
    
    try {
      // Get preview data from the file
      const preview = await fileService.getSampleData(fileId, 10);
      setPreviewData(preview);
      
      // Trigger the agent workflow sequence
      await simulateAgentWorkflow(preview);
      
    } catch (error) {
      console.error('Error getting file preview:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to load preview data');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Simulate agent workflow execution
  const simulateAgentWorkflow = async (data: SampleData) => {
    const agents = [
      {
        id: 'data-profile',
        delay: 1000,
        output: `Data Profile Analysis Complete:\n• ${data.rows.length} rows analyzed\n• ${data.columns.length} columns detected\n• Data types: ${data.columns.map(c => `${c.name}(${c.type})`).join(', ')}\n• Quality Score: 94%`
      },
      {
        id: 'planning',
        delay: 1500,
        output: `Analysis Strategy Generated:\n• Demographic analysis by department\n• Age distribution patterns\n• Email domain analysis\n• Department performance metrics\n• Recommended visualizations: Bar charts, Pie charts, Histograms`
      },
      {
        id: 'insight',
        delay: 2000,
        output: `Key Insights Discovered:\n• Engineering has the highest average age (45.2 years)\n• Support team has youngest employees (avg 28.4 years)\n• Sales department has 40% of total employees\n• 15% email domains are company email\n• Gender distribution appears balanced`
      },
      {
        id: 'viz',
        delay: 2500,
        output: `Visualizations Created:\n• Department Distribution (Pie Chart)\n• Age vs Department (Box Plot)\n• Employee Count by Department (Bar Chart)\n• Age Histogram\n• All visualizations optimized for dashboard display`
      },
      {
        id: 'critique',
        delay: 3000,
        output: `Analysis Review:\n• Data quality: Excellent (94% complete)\n• Sample size: Adequate for analysis\n• Potential bias: None detected\n• Recommendations: Consider adding salary data for compensation analysis\n• Confidence level: High`
      },
      {
        id: 'debate',
        delay: 3500,
        output: `Alternative Perspectives:\n• Consider temporal analysis trends\n• Department size may affect age distribution\n• Geographic data could provide additional insights\n• Consider external factors (hiring patterns, industry trends)\n• Consensus: Current analysis provides solid foundation`
      },
      {
        id: 'report',
        delay: 4000,
        output: `Executive Summary Generated:\n• Total ${data.rows.length} employees across ${[...new Set(data.rows.map((r: any) => r.department))].length} departments\n• Key finding: Department-based age variance\n• Actionable insights ready\n• Dashboard and visualizations prepared\n• Report ready for stakeholder review`
      }
    ];

    for (const agent of agents) {
      // Set processing state
      setAgentStates(prev => ({
        ...prev,
        [agent.id]: { ...prev[agent.id], status: 'processing' }
      }));

      // Wait for simulation delay
      await new Promise(resolve => setTimeout(resolve, agent.delay));

      // Complete the agent
      setAgentStates(prev => ({
        ...prev,
        [agent.id]: { 
          status: 'completed', 
          output: agent.output,
          isExpanded: false 
        }
      }));
    }
  };

  // Toggle agent expansion
  const toggleAgent = (agentId: string) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        isExpanded: !prev[agentId].isExpanded
      }
    }));
  };

  // Function to handle file deletion
  const handleFileDeleted = () => {
    setPreviewData(null);
    setPreviewError(null);
    
    // Reset all agents to waiting state
    setAgentStates({
      'file-upload': { status: 'waiting', output: '', isExpanded: false },
      'data-profile': { status: 'waiting', output: '', isExpanded: false },
      'planning': { status: 'waiting', output: '', isExpanded: false },
      'insight': { status: 'waiting', output: '', isExpanded: false },
      'viz': { status: 'waiting', output: '', isExpanded: false },
      'critique': { status: 'waiting', output: '', isExpanded: false },
      'debate': { status: 'waiting', output: '', isExpanded: false },
      'report': { status: 'waiting', output: '', isExpanded: false }
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 relative">
      {/* Background overlay for glassmorphism effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,41,99,0.2),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.15),transparent_70%)]" />
      
      <div className="relative z-10">
        <Navbar />
        <div className="w-full">
        
        {/* Main 2-Column Layout Container - Full width usage */}
        <div className="flex flex-col md:flex-row gap-2 w-full px-2 py-2">
          {/* Left Column (40%) - Upload and Chat */}
          <div className="w-full md:w-2/5 space-y-2">
            {/* Upload Section */}
            <FileUpload
              onFileUploaded={handleFileUploaded}
              onFileDeleted={handleFileDeleted}
              onError={(error) => setPreviewError(error.message)}
            />
            
            {/* CSV Preview Section */}
            {isPreviewLoading && (
              <div className="glass-card p-4 text-center">
                <div className="animate-pulse text-white">Loading preview data...</div>
              </div>
            )}
            
            {previewError && (
              <div className="glass-card p-4 bg-red-500/20 border border-red-400/30">
                <p className="text-red-200">{previewError}</p>
              </div>
            )}
            
            {previewData && !isPreviewLoading && (
              <div className="glass-card p-4">
                <h3 className="text-lg font-medium text-white mb-3">CSV Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-blue-200">
                    <thead className="text-xs uppercase bg-blue-900/30 text-blue-100">
                      <tr>
                        {previewData.columns.map((column) => (
                          <th key={column.name} className="px-4 py-2">
                            {column.name}
                            <div className="text-blue-300/60 text-xs font-normal">{column.type}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, idx) => (
                        <tr key={`row-${idx}-${Object.values(row).join('-')}`} className="border-b border-blue-800/30 bg-blue-900/10 hover:bg-blue-900/20">
                          {previewData.columns.map((column) => (
                            <td key={`cell-${idx}-${column.name}`} className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                              {row[column.name] !== null ? String(row[column.name]) : <span className="text-blue-400/40">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Chat Section */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Ask Copilot</h2>
              <textarea 
                className="glass-input text-white p-4 w-full mb-4"
                placeholder="Type your analytics query..."
                rows={3}
              ></textarea>
              <div className="flex justify-end">
                <button className="glass-button text-white px-6 py-3">Send</button>
              </div>
            </div>
          </div>
          
          {/* Right Column (60%) - Agent Workflow */}
          <div className="w-full md:w-3/5">
            <div className="glass-card p-6 h-full depth-shadow">
              <h2 className="text-2xl font-semibold text-white mb-6">Agent Workflow</h2>
              
              <div className="space-y-3">
                {/* File Upload Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('file-upload')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/file-upload-agent-icon-black.svg" alt="File Upload Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">File Upload Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['file-upload'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['file-upload'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['file-upload'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      {agentStates['file-upload'].status === 'ready' && <span className="text-blue-400 text-sm">🟢 Ready</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['file-upload'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['file-upload'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Handles file upload, validation, and preprocessing</p>
                      {agentStates['file-upload'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['file-upload'].output}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Data Profile Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('data-profile')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/data-profile-agent-icon-black.svg" alt="Data Profile Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">Data Profile Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['data-profile'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['data-profile'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['data-profile'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['data-profile'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['data-profile'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Analyzes data types, distributions, and quality</p>
                      {agentStates['data-profile'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['data-profile'].output}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Planning Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('planning')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/planning-agent-icon-black.svg" alt="Planning Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">Planning Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['planning'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['planning'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['planning'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['planning'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['planning'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Creates analysis strategy and execution plan</p>
                      {agentStates['planning'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['planning'].output}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Insight Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('insight')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/insight-agent-icon-black.svg" alt="Insight Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">Insight Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['insight'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['insight'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['insight'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['insight'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['insight'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Discovers patterns, trends, and key insights</p>
                      {agentStates['insight'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['insight'].output}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Viz Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('viz')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/viz-agent-icon-black.svg" alt="Viz Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">Viz Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['viz'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['viz'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['viz'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['viz'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['viz'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Creates interactive charts and visualizations</p>
                      {agentStates['viz'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['viz'].output}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Critique Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('critique')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/critique-agent-icon-black.svg" alt="Critique Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">Critique Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['critique'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['critique'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['critique'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['critique'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['critique'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Reviews and validates analysis quality</p>
                      {agentStates['critique'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['critique'].output}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Debate Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('debate')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/debate-agent-icon-black.svg" alt="Debate Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">Debate Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['debate'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['debate'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['debate'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['debate'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['debate'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Explores alternative perspectives and approaches</p>
                      {agentStates['debate'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['debate'].output}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Report Agent */}
                <div className="agent-card">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => toggleAgent('report')}
                  >
                    <div className="flex items-center gap-3">
                      <Image src="/icons/report-agent-icon-black.svg" alt="Report Agent" width={24} height={24} />
                      <span className="text-base font-medium text-white">Report Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStates['report'].status === 'waiting' && <span className="text-gray-400 text-sm">⏸️ Waiting</span>}
                      {agentStates['report'].status === 'processing' && <span className="text-yellow-400 text-sm">🔄 Processing</span>}
                      {agentStates['report'].status === 'completed' && <span className="text-green-400 text-sm">✅ Complete</span>}
                      <div className={`transform transition-transform duration-200 text-white/60 ${agentStates['report'].isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 11L3 6h10l-5 5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {agentStates['report'].isExpanded && (
                    <div className="px-4 pb-4 text-sm text-blue-200/80 bg-blue-900/10 rounded-b-lg">
                      <p className="mb-2"><strong>Function:</strong> Compiles comprehensive final report</p>
                      {agentStates['report'].output && (
                        <p className="whitespace-pre-line"><strong>Output:</strong><br/>{agentStates['report'].output}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Visualization Panel - Full Width */}
        <div className="mt-2 w-full px-2">
          <div className="glass-card p-4 depth-shadow w-full">
            <h2 className="text-xl font-semibold text-white mb-3">Data Visualization</h2>
            <div className="glass-card-dark h-56 flex items-center justify-center text-white/70 w-full">
              Visualization Area
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
