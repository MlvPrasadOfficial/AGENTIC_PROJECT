/**
 * File: page.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Home page component with 2-column layout for Enterprise Insights Copilot
 */

"use client";

import React from 'react';
import '../styles/glassmorphism.css';

export default function Page() {
  return (
    <div className="min-h-screen py-10 background-gradient">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-10 text-center">Enterprise Insights Copilot</h1>
        
        {/* Main 2-Column Layout Container - Left 40%, Right 60% with increased spacing */}
        <div className="flex flex-col md:flex-row gap-16">
          {/* Left Column (40%) - Upload and Chat */}
          <div className="w-full md:w-2/5 space-y-8">
            {/* Upload Section */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Upload your Data</h2>
              <div className="mb-4">
                <p className="text-base font-medium mb-2 text-white">Drag and drop a file</p>
                <p className="text-base text-white/70">here, or click to browse</p>
              </div>
              <p className="text-sm text-white/70 mb-2">CSV, XLSX, JSON supported</p>
            </div>
            
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
                  <span className="text-base font-medium text-white">File Upload Agent</span>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <span className="text-base font-medium text-white">Data Profile Agent</span>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <span className="text-base font-medium text-white">Planning Agent</span>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <span className="text-base font-medium text-white">Insight Agent</span>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <span className="text-base font-medium text-white">Viz Agent</span>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <span className="text-base font-medium text-white">Critique Agent</span>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <span className="text-base font-medium text-white">Debate Agent</span>
                </div>
                <div className="agent-card flex justify-between items-center p-4">
                  <span className="text-base font-medium text-white">Report Agent</span>
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
