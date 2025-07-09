/**
 * File: page.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Home page component with 2-column layout for Enterprise Insights Copilot
 */

"use client";

import React, { useState } from 'react';
import '../styles/glassmorphism.css';
import { FileUpload } from '@/components/upload/FileUpload';
import fileService, { SampleData } from '@/lib/api/fileService';

export default function Page() {
  // State to store preview data
  const [previewData, setPreviewData] = useState<SampleData | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // Function to handle file upload completion
  const handleFileUploaded = async (fileId: string) => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    
    try {
      // Get preview data from the file
      const preview = await fileService.getSampleData(fileId, 10);
      setPreviewData(preview);
    } catch (error) {
      console.error('Error getting file preview:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to load preview data');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Function to handle file deletion
  const handleFileDeleted = () => {
    setPreviewData(null);
    setPreviewError(null);
  };
  
  return (
    <div className="min-h-screen py-10 background-gradient">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-10 text-center">Enterprise Insights Copilot</h1>
        
        {/* Main 2-Column Layout Container - Left 40%, Right 60% with increased spacing */}
        <div className="flex flex-col md:flex-row gap-16">
          {/* Left Column (40%) - Upload and Chat */}
          <div className="w-full md:w-2/5 space-y-8">
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
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/file-upload-agent-icon-black.svg" alt="File Upload Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">File Upload Agent</span>
                  </div>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/data-profile-agent-icon-black.svg" alt="Data Profile Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">Data Profile Agent</span>
                  </div>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/planning-agent-icon-black.svg" alt="Planning Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">Planning Agent</span>
                  </div>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/insight-agent-icon-black.svg" alt="Insight Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">Insight Agent</span>
                  </div>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/viz-agent-icon-black.svg" alt="Viz Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">Viz Agent</span>
                  </div>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/critique-agent-icon-black.svg" alt="Critique Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">Critique Agent</span>
                  </div>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/debate-agent-icon-black.svg" alt="Debate Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">Debate Agent</span>
                  </div>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/report-agent-icon-black.svg" alt="Report Agent" className="w-6 h-6" />
                    <span className="text-base font-medium text-white">Report Agent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Visualization Panel - Full Width */}
        <div className="mt-6">
          <div className="glass-card p-6 depth-shadow">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Visualization</h2>
            <div className="glass-card-dark h-60 flex items-center justify-center text-white/70">
              Visualization Area
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
