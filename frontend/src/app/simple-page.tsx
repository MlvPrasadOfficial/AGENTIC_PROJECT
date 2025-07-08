'use client';

import React from 'react';
import '../styles/glassmorphism.css';

export default function Page() {
  return (
    <React.Fragment>
      <div className="min-h-screen py-10" style={{ background: "linear-gradient(135deg, #0a0b14 0%, #171826 100%)" }}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-10 text-center">Enterprise Insights Copilot</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-6">
              <div style={{ 
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "16px",
                padding: "24px",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <h2 className="text-2xl font-semibold text-white mb-4">Upload your Data</h2>
                <div className="mb-4">
                  <p className="text-base font-medium mb-2 text-white">Drag and drop a file</p>
                  <p className="text-base text-gray-300">here, or click to browse</p>
                </div>
                <p className="text-sm text-gray-300 mb-2">CSV, XLSX, JSON supported</p>
              </div>
              
              <div style={{ 
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "16px",
                padding: "24px",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <h2 className="text-2xl font-semibold text-white mb-4">Ask Copilot</h2>
                <textarea 
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    borderRadius: "10px",
                    padding: "16px",
                    color: "white",
                    width: "100%",
                    marginBottom: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                  placeholder="Type your analytics query..."
                  rows={3}
                ></textarea>
                <div className="flex justify-end">
                  <button style={{
                    background: "rgba(37, 99, 235, 0.9)",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "10px"
                  }}>Send</button>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-7">
              <div style={{ 
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "16px",
                padding: "24px",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: "100%"
              }}>
                <h2 className="text-2xl font-semibold text-white mb-6">Agent Workflow</h2>
                
                <div className="space-y-5">
                  {["File Upload Agent", "Data Profile Agent", "Planning Agent", 
                    "Insight Agent", "Viz Agent", "Critique Agent", 
                    "Debate Agent", "Report Agent"].map((agent, index) => (
                    <div key={index} style={{
                      background: "rgba(51, 65, 85, 0.5)",
                      borderRadius: "10px",
                      padding: "20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span className="text-lg font-medium text-white">{agent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div style={{ 
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "16px",
              padding: "24px",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Visualization</h2>
              <div style={{
                background: "rgba(15, 23, 42, 0.7)",
                height: "384px", // 24rem or h-96
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.7)",
                borderRadius: "16px"
              }}>
                Visualization Area
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
