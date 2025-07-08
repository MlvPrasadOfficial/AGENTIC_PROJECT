/**
 * File: frontend/src/features/agents/AgentPipeline.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Complete pipeline component for managing the 11-agent workflow
 * 
 * This component provides a comprehensive view of the agent pipeline with:
 * - Visual representation of all 11 agents in sequence
 * - Real-time status tracking and progress indicators
 * - Interactive controls for pipeline management
 * - Detailed view of each agent's current state and output
 * 
 * Pipeline Agents:
 * 1. Data Agent - Data processing and validation
 * 2. SQL Agent - Database operations and queries
 * 3. Cleaner Agent - Data cleaning and transformation
 * 4. Insight Agent - AI-powered analysis and insights
 * 5. Planning Agent - Strategy and planning recommendations
 * 6. Chart Agent - Data visualization generation
 * 7. Query Agent - Natural language query processing
 * 8. Critique Agent - Quality review and validation
 * 9. Debate Agent - Multi-perspective analysis
 * 10. Narrative Agent - Story and report generation
 * 11. Report Agent - Final report compilation and export
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Agent status type definition
type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'waiting';

// Individual agent configuration
interface AgentConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: AgentStatus;
  progress: number;
  output?: string;
}

interface AgentPipelineProps {
  /**
   * Additional CSS classes for custom styling
   */
  readonly className?: string;
  
  /**
   * Enable/disable pipeline controls
   */
  readonly interactive?: boolean;
  
  /**
   * Pipeline execution mode
   */
  readonly mode?: 'sequential' | 'parallel' | 'manual';
  
  /**
   * Callback when pipeline status changes
   */
  readonly onStatusChange?: (status: AgentStatus, agentId: string) => void;
}

/**
 * AgentPipeline Component
 * 
 * Manages and displays the complete 11-agent workflow pipeline with
 * real-time status tracking, interactive controls, and detailed progress
 * visualization for data processing and analysis tasks.
 * 
 * @param className - Additional CSS classes
 * @param interactive - Enable pipeline controls
 * @param mode - Pipeline execution mode
 * @param onStatusChange - Status change callback
 * @returns {JSX.Element} The complete agent pipeline interface
 */
export function AgentPipeline({ 
  className,
  interactive = true,
  mode = 'sequential',
  onStatusChange
}: AgentPipelineProps) {
  // Initialize agents with default configuration
  const [agents, setAgents] = useState<AgentConfig[]>([
    { id: 'data', name: 'Data Agent', icon: '📊', description: 'Processing and validating input data', status: 'idle', progress: 0 },
    { id: 'sql', name: 'SQL Agent', icon: '🗄️', description: 'Database operations and queries', status: 'idle', progress: 0 },
    { id: 'cleaner', name: 'Cleaner Agent', icon: '🧹', description: 'Data cleaning and transformation', status: 'idle', progress: 0 },
    { id: 'insight', name: 'Insight Agent', icon: '💡', description: 'AI-powered analysis and insights', status: 'idle', progress: 0 },
    { id: 'planning', name: 'Planning Agent', icon: '🎯', description: 'Strategy and planning recommendations', status: 'idle', progress: 0 },
    { id: 'chart', name: 'Chart Agent', icon: '📈', description: 'Data visualization generation', status: 'idle', progress: 0 },
    { id: 'query', name: 'Query Agent', icon: '❓', description: 'Natural language query processing', status: 'idle', progress: 0 },
    { id: 'critique', name: 'Critique Agent', icon: '⚖️', description: 'Quality review and validation', status: 'idle', progress: 0 },
    { id: 'debate', name: 'Debate Agent', icon: '🤝', description: 'Multi-perspective analysis', status: 'idle', progress: 0 },
    { id: 'narrative', name: 'Narrative Agent', icon: '📄', description: 'Story and report generation', status: 'idle', progress: 0 },
    { id: 'report', name: 'Report Agent', icon: '📋', description: 'Final report compilation and export', status: 'idle', progress: 0 }
  ]);

  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');

  /**
   * Update agent status and notify parent component
   */
  const updateAgentStatus = useCallback((agentId: string, status: AgentStatus, progress: number = 0) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status, progress } : agent
    ));
    onStatusChange?.(status, agentId);
  }, [onStatusChange]);

  /**
   * Start pipeline execution
   */
  const startPipeline = () => {
    setPipelineStatus('running');
    // Reset all agents to idle state
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'idle', progress: 0 })));
    
    // Start first agent
    updateAgentStatus('data', 'running', 0);
  };

  /**
   * Simulate agent execution for demo purposes
   */
  useEffect(() => {
    if (pipelineStatus === 'running') {
      const runningAgent = agents.find(agent => agent.status === 'running');
      if (runningAgent) {
        const timer = setTimeout(() => {
          // Complete current agent
          updateAgentStatus(runningAgent.id, 'completed', 100);
          
          // Start next agent in sequential mode
          if (mode === 'sequential') {
            const currentIndex = agents.findIndex(agent => agent.id === runningAgent.id);
            const nextAgent = agents[currentIndex + 1];
            
            if (nextAgent) {
              updateAgentStatus(nextAgent.id, 'running', 0);
            } else {
              // Pipeline completed
              setPipelineStatus('completed');
            }
          }
        }, 2000); // 2 second simulation per agent
        
        return () => clearTimeout(timer);
      }
    }
    
    return () => {}; // Empty cleanup function
  }, [agents, pipelineStatus, mode, updateAgentStatus]);

  return (
    <div className={cn(
      'w-full space-y-6',
      className
    )}>
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Agent Pipeline</h3>
          <p className="text-sm text-gray-400">11-agent workflow for data processing and analysis</p>
        </div>
        
        {interactive && (
          <div className="flex gap-2">
            <button
              onClick={startPipeline}
              disabled={pipelineStatus === 'running'}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all',
                'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                'hover:bg-blue-500/30 hover:border-blue-500/50',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {pipelineStatus === 'running' ? 'Running...' : 'Start Pipeline'}
            </button>
          </div>
        )}
      </div>

      {/* Pipeline Status */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-3 h-3 rounded-full',
            pipelineStatus === 'idle' && 'bg-gray-500',
            pipelineStatus === 'running' && 'bg-blue-500 animate-pulse',
            pipelineStatus === 'completed' && 'bg-green-500',
            pipelineStatus === 'error' && 'bg-red-500'
          )} />
          <span className="text-white font-medium">
            Pipeline Status: {pipelineStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={cn(
              'glass-card p-4 rounded-xl transition-all duration-300',
              agent.status === 'running' && 'ring-2 ring-blue-500/50 bg-blue-500/10',
              agent.status === 'completed' && 'ring-2 ring-green-500/50 bg-green-500/10',
              agent.status === 'error' && 'ring-2 ring-red-500/50 bg-red-500/10'
            )}
          >
            {/* Agent Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{agent.icon}</span>
              <div className="flex-1">
                <h4 className="text-white font-medium">{agent.name}</h4>
                <p className="text-xs text-gray-400">{agent.description}</p>
              </div>
              {/* Status Indicator */}
              <div className={cn(
                'w-2 h-2 rounded-full',
                agent.status === 'idle' && 'bg-gray-500',
                agent.status === 'waiting' && 'bg-yellow-500',
                agent.status === 'running' && 'bg-blue-500 animate-pulse',
                agent.status === 'completed' && 'bg-green-500',
                agent.status === 'error' && 'bg-red-500'
              )} />
            </div>

            {/* Progress Bar */}
            {agent.status === 'running' && (
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            )}

            {/* Agent Status Text */}
            <div className="text-xs text-gray-400 capitalize">
              Status: {agent.status}
              {agent.status === 'running' && ` (${agent.progress}%)`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
