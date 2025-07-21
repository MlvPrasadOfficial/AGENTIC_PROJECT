/**
 * File: upload-test-page.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-19
 * Purpose: Test page for the upload functionality
 */

'use client';

import React, { useState } from 'react';
import { checkUploadUIStatusBrowser } from '@/tests/check_upload_ui_status_browser';

/**
 * Upload Test Page Component
 * 
 * This component provides a UI for testing the file upload functionality.
 * It allows running the test and displays detailed logs and results.
 */
export default function UploadTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  /**
   * Run the upload UI test
   * This function executes the test and updates the UI with the results
   */
  const runTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      const result = await checkUploadUIStatusBrowser();
      setTestResult(result);
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-bold mb-4">Upload UI Test</h1>
        <p className="mb-4">
          This page tests the file upload functionality by sending a test CSV file to the backend
          and monitoring the response and status.
        </p>
        
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={runTest}
            disabled={isRunning}
            className={`glass-button-primary px-4 py-2 ${isRunning ? 'opacity-50' : ''}`}
          >
            {isRunning ? 'Test Running...' : 'Run Upload Test'}
          </button>
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Test Status</h2>
          <div 
            id="test-status"
            className={`p-3 rounded ${testResult ? 
              (testResult.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') 
              : 'bg-gray-700/50 text-gray-400'}`}
          >
            {testResult 
              ? `${testResult.status}: ${testResult.message}` 
              : 'Test not run yet'}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Log</h2>
          <div 
            id="test-log"
            className="h-80 overflow-auto bg-black/30 p-4 rounded font-mono text-sm text-gray-300"
          >
            {!isRunning && !testResult && <em>Test log will appear here...</em>}
          </div>
        </div>
        
        {testResult && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Test Results</h2>
            <div className="bg-gray-800/50 p-4 rounded">
              <pre className="whitespace-pre-wrap text-sm text-gray-300">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
