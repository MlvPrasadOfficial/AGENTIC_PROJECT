/**
 * File: page.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Home page component implementing the detailed 2-column layout with agent workflow and dashboard visualization
 * Project: Enterprise Insights Copilot - AI-powered analytics platform with glassmorphism design
 * Features: Upload section, RAG chat interface, 11-agent workflow pipeline, and visualization dashboard
 */

'use client';

import { Suspense } from 'react';
import { UploadSection } from '@/features/upload/upload-section';
import { ChatSection } from '@/features/chat/chat-section';
import { AgentWorkflow } from '@/features/agents/agent-workflow';
import { VisualizationDashboard } from '@/features/dashboard/visualization-dashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/shared/error-boundary';

/**
 * Home Page Component
 * Implements the detailed enterprise-grade layout from 09-frontend-architecture.txt
 * Features:
 * - Left Column (40%): Upload + Chat sections
 * - Right Column (60%): Agent Workflow pipeline
 * - Bottom: Full-width Visualization Dashboard
 */
export default function HomePage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
        {/* Two-Column Layout Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-8">
          {/* Left Column - Data Input & Conversation (40% / 2 of 5 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Section */}
            <ErrorBoundary fallback={<div className="glass-card p-6 text-center text-red-400">Upload section failed to load</div>}>
              <Suspense fallback={
                <div className="glass-card p-8">
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-400">Loading upload section...</span>
                  </div>
                </div>
              }>
                <UploadSection />
              </Suspense>
            </ErrorBoundary>
            
            {/* RAG Chat Copilot Section */}
            <ErrorBoundary fallback={<div className="glass-card p-6 text-center text-red-400">Chat section failed to load</div>}>
              <Suspense fallback={
                <div className="glass-card p-8">
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-400">Loading chat interface...</span>
                  </div>
                </div>
              }>
                <ChatSection />
              </Suspense>
            </ErrorBoundary>
          </div>
          
          {/* Right Column - Agent Workflow (60% / 3 of 5 columns) */}
          <div className="lg:col-span-3">
            <ErrorBoundary fallback={<div className="glass-card p-6 text-center text-red-400">Agent workflow failed to load</div>}>
              <Suspense fallback={
                <div className="glass-card p-8">
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-400">Loading agent workflow...</span>
                  </div>
                </div>
              }>
                <AgentWorkflow />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        
        {/* Full-Width Visualization Dashboard */}
        <div className="w-full">
          <ErrorBoundary fallback={<div className="glass-card p-6 text-center text-red-400">Dashboard failed to load</div>}>
            <Suspense fallback={
              <div className="glass-card p-8">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-400">Loading visualization dashboard...</span>
                </div>
              </div>
            }>
              <VisualizationDashboard />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
      
      {/* Floating Action Button for Quick Upload (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button 
          className="glass-button-primary w-14 h-14 rounded-full shadow-glass-hover"
          aria-label="Quick upload"
          onClick={() => {
            // Scroll to upload section
            const uploadSection = document.querySelector('[data-upload-section]');
            uploadSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </button>
      </div>
      
      {/* Floating Status Indicator */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="glass-card px-4 py-2 flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Connected</span>
          </div>
          
          {/* Active Workflows */}
          <div className="flex items-center gap-2 border-l border-white/20 pl-3">
            <svg 
              className="w-4 h-4 text-blue-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
            <span className="text-sm text-gray-300">2 active</span>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
}

/**
 * Loading component for the entire page
 */
export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Loading Enterprise Insights</h2>
        <p className="text-gray-400">Initializing agent workflow and dashboard...</p>
      </div>
    </div>
  );
}

/**
 * Error component for page-level errors
 */
export function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">An error occurred while loading the application.</p>
        <div className="space-y-3">
          <button 
            onClick={reset}
            className="glass-button-primary w-full"
          >
            Try again
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="glass-button-secondary w-full"
          >
            Reload page
          </button>
        </div>
        
        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
