/**
 * File: frontend/src/features/agents/AgentCard.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Individual agent card component for displaying agent status and details
 * 
 * This component provides a detailed view of individual agents with:
 * - Real-time status indicators and progress tracking
 * - Interactive controls for agent management
 * - Output display and error handling
 * - Consistent glassmorphism styling
 * 
 * Features:
 * - Status-based visual styling
 * - Progress bar with percentage display
 * - Expandable output sections
 * - Action buttons for agent control
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Agent status type definition
type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'waiting';

interface AgentCardProps {
  /**
   * Unique identifier for the agent
   */
  readonly id: string;
  
  /**
   * Display name of the agent
   */
  readonly name: string;
  
  /**
   * Agent icon (emoji or icon class)
   */
  readonly icon: string;
  
  /**
   * Brief description of agent functionality
   */
  readonly description: string;
  
  /**
   * Current status of the agent
   */
  readonly status: AgentStatus;
  
  /**
   * Progress percentage (0-100)
   */
  readonly progress?: number;
  
  /**
   * Agent output or result data
   */
  readonly output?: string;
  
  /**
   * Error message if status is 'error'
   */
  readonly error?: string;
  
  /**
   * Enable interactive controls
   */
  readonly interactive?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Callback when agent is started
   */
  readonly onStart?: (agentId: string) => void;
  
  /**
   * Callback when agent is stopped
   */
  readonly onStop?: (agentId: string) => void;
  
  /**
   * Callback when agent is reset
   */
  readonly onReset?: (agentId: string) => void;
}

/**
 * AgentCard Component
 * 
 * Individual agent display component providing detailed status information,
 * progress tracking, and interactive controls for managing agent execution
 * within the pipeline workflow.
 * 
 * @param id - Unique agent identifier
 * @param name - Agent display name
 * @param icon - Agent icon representation
 * @param description - Agent functionality description
 * @param status - Current agent status
 * @param progress - Execution progress percentage
 * @param output - Agent output data
 * @param error - Error message if applicable
 * @param interactive - Enable control buttons
 * @param className - Additional CSS classes
 * @param onStart - Start agent callback
 * @param onStop - Stop agent callback
 * @param onReset - Reset agent callback
 * @returns {JSX.Element} The agent card component
 */
export function AgentCard({ 
  id,
  name,
  icon,
  description,
  status,
  progress = 0,
  output,
  error,
  interactive = false,
  className,
  onStart,
  onStop,
  onReset
}: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Status-based styling
  const statusClasses = {
    idle: 'border-gray-500/30 bg-gray-500/5',
    waiting: 'border-yellow-500/30 bg-yellow-500/5',
    running: 'border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/20',
    completed: 'border-green-500/50 bg-green-500/10 ring-2 ring-green-500/20',
    error: 'border-red-500/50 bg-red-500/10 ring-2 ring-red-500/20'
  };

  // Status indicator colors
  const statusIndicators = {
    idle: 'bg-gray-500',
    waiting: 'bg-yellow-500',
    running: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  };

  // Progress bar colors
  const progressColors = {
    idle: 'bg-gray-500',
    waiting: 'bg-yellow-500',
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn(
      'glass-card rounded-xl border transition-all duration-300',
      statusClasses[status],
      className
    )}>
      {/* Agent Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Agent Icon */}
          <div className="text-2xl">{icon}</div>
          
          {/* Agent Info */}
          <div className="flex-1">
            <h4 className="text-white font-semibold">{name}</h4>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              statusIndicators[status]
            )} />
            <span className="text-xs text-gray-400 capitalize">
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {(status === 'running' || status === 'completed') && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                progressColors[status]
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Output/Error Section */}
      {(output || error) && (
        <div className="px-4 py-3 border-b border-white/10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm text-gray-400">
              {error ? 'Error Details' : 'Output'}
            </span>
            <svg
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                expanded && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expanded && (
            <div className="mt-3 p-3 bg-black/20 rounded-lg">
              <pre className={cn(
                'text-xs whitespace-pre-wrap',
                error ? 'text-red-400' : 'text-gray-300'
              )}>
                {error || output}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Interactive Controls */}
      {interactive && (
        <div className="p-4">
          <div className="flex gap-2">
            {status === 'idle' && onStart && (
              <button
                onClick={() => onStart(id)}
                className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Start
              </button>
            )}
            
            {status === 'running' && onStop && (
              <button
                onClick={() => onStop(id)}
                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Stop
              </button>
            )}
            
            {(status === 'completed' || status === 'error') && onReset && (
              <button
                onClick={() => onReset(id)}
                className="px-3 py-1 text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
