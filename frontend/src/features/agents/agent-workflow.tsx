/**
 * File: agent-workflow.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Agent workflow component displaying the 11-agent pipeline with status tracking and glassmorphic design
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  FileUploadAgentIcon, 
  DataProfileAgentIcon, 
  PlanningAgentIcon, 
  InsightAgentIcon,
  VizAgentIcon,
  CritiqueAgentIcon,
  DebateAgentIcon,
  ReportAgentIcon
} from '@/components/icons/agents';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: 'file-upload' | 'data-profile' | 'planning' | 'insight' | 'viz' | 'critique' | 'debate' | 'report';
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  logs: string[];
  dependencies: string[];
  outputs?: string[];
  error?: string;
}

interface AgentWorkflowProps {
  /** Whether to show detailed logs */
  showLogs?: boolean;
  /** Callback when agent status changes */
  onAgentStatusChange?: (agentId: string, status: Agent['status']) => void;
  /** Custom className */
  className?: string;
}

/**
 * Agent Workflow Component
 * 
 * Features:
 * - 11-agent pipeline visualization
 * - Real-time status updates
 * - Collapsible agent cards
 * - Progress tracking
 * - Log viewing
 * - Dependency management
 * - Glassmorphic design
 * 
 * @example
 * <AgentWorkflow 
 *   showLogs={true}
 *   onAgentStatusChange={handleAgentStatusChange}
 * />
 */
export function AgentWorkflow({
  showLogs = false,
  onAgentStatusChange,
  className,
}: AgentWorkflowProps) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'file-upload-agent',
      name: 'File Upload Agent',
      description: 'File ingestion and validation',
      icon: 'file-upload',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: [],
    },
    {
      id: 'data-profile-agent',
      name: 'Data Profile Agent',
      description: 'Data cleaning and quality assessment',
      icon: 'data-profile',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: ['file-upload-agent'],
    },
    {
      id: 'planning-agent',
      name: 'Planning Agent',
      description: 'Query parsing and routing logic',
      icon: 'planning',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: ['data-profile-agent'],
    },
    {
      id: 'insight-agent',
      name: 'Insight Agent',
      description: 'Natural language query processing',
      icon: 'insight',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: ['planning-agent'],
    },
    {
      id: 'viz-agent',
      name: 'Viz Agent',
      description: 'Visualization configuration and rendering',
      icon: 'viz',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: ['insight-agent'],
    },
    {
      id: 'critique-agent',
      name: 'Critique Agent',
      description: 'Quality assessment and improvement suggestions',
      icon: 'critique',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: ['viz-agent'],
    },
    {
      id: 'debate-agent',
      name: 'Debate Agent',
      description: 'Multi-perspective analysis and consensus',
      icon: 'debate',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: ['critique-agent'],
    },
    {
      id: 'report-agent',
      name: 'Report Agent',
      description: 'Comprehensive report compilation',
      icon: 'report',
      status: 'idle',
      progress: 0,
      logs: [],
      dependencies: ['debate-agent'],
    },
  ]);

  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [pipelineStartTime, setPipelineStartTime] = useState<Date | null>(null);

  // Get agent status color
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'processing': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get agent status background
  const getStatusBackground = (status: Agent['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-700/20 border-gray-600/50';
      case 'processing': return 'bg-blue-500/20 border-blue-500/50';
      case 'completed': return 'bg-green-500/20 border-green-500/50';
      case 'error': return 'bg-red-500/20 border-red-500/50';
      default: return 'bg-gray-700/20 border-gray-600/50';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'idle': return '⚪';
      case 'processing': return '🟡';
      case 'completed': return '🟢';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  // Toggle agent expansion
  const toggleAgentExpansion = (agentId: string) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  // Update agent status
  const updateAgentStatus = (agentId: string, status: Agent['status'], progress: number = 0) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const updates: Partial<Agent> = {
          status,
          progress,
        };
        
        if (status === 'processing') {
          updates.startTime = new Date();
        } else if (status === 'completed' || status === 'error') {
          updates.endTime = new Date();
        }
        
        return { ...agent, ...updates };
      }
      return agent;
    }));
    
    if (onAgentStatusChange) {
      onAgentStatusChange(agentId, status);
    }
  };

  // Add log to agent
  const addAgentLog = (agentId: string, log: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, logs: [...agent.logs, `${new Date().toLocaleTimeString()}: ${log}`] }
        : agent
    ));
  };

  // Start pipeline
  const startPipeline = () => {
    setPipelineStatus('processing');
    setPipelineStartTime(new Date());
    
    // Reset all agents
    setAgents(prev => prev.map(agent => {
      const { startTime, endTime, ...resetAgent } = agent;
      return {
        ...resetAgent,
        status: 'idle' as const,
        progress: 0,
        logs: [],
      };
    }));

    // Start first agent
    updateAgentStatus('data-agent', 'processing');
    addAgentLog('data-agent', 'Starting data ingestion process...');
  };

  // Stop pipeline
  const stopPipeline = () => {
    setPipelineStatus('idle');
    setPipelineStartTime(null);
    
    // Stop all processing agents
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: agent.status === 'processing' ? 'idle' : agent.status,
      progress: agent.status === 'processing' ? 0 : agent.progress,
    })));
  };

  // Reset pipeline
  const resetPipeline = () => {
    setPipelineStatus('idle');
    setPipelineStartTime(null);
    
    // Reset all agents
    setAgents(prev => prev.map(agent => {
      const { startTime, endTime, ...resetAgent } = agent;
      return {
        ...resetAgent,
        status: 'idle' as const,
        progress: 0,
        logs: [],
      };
    }));
  };

  // Calculate overall progress
  const getOverallProgress = () => {
    const totalAgents = agents.length;
    const completedAgents = agents.filter(agent => agent.status === 'completed').length;
    return (completedAgents / totalAgents) * 100;
  };

  // Get success rate
  const getSuccessRate = () => {
    const processedAgents = agents.filter(agent => agent.status === 'completed' || agent.status === 'error').length;
    const successfulAgents = agents.filter(agent => agent.status === 'completed').length;
    return processedAgents > 0 ? (successfulAgents / processedAgents) * 100 : 0;
  };

  // Format duration
  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={cn('glass-card p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Agent Workflow</h2>
          <p className="text-sm text-gray-400">
            11-agent pipeline for comprehensive data analysis
          </p>
        </div>
        
        {/* Pipeline Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={startPipeline}
            disabled={pipelineStatus === 'processing'}
            className={cn(
              'glass-button px-3 py-1.5 text-sm',
              pipelineStatus === 'processing' 
                ? 'opacity-50 cursor-not-allowed' 
                : 'glass-button-primary hover:scale-105'
            )}
          >
            ▶️ Start
          </button>
          
          <button
            onClick={stopPipeline}
            disabled={pipelineStatus !== 'processing'}
            className={cn(
              'glass-button px-3 py-1.5 text-sm',
              pipelineStatus !== 'processing' 
                ? 'opacity-50 cursor-not-allowed' 
                : 'glass-button-secondary hover:scale-105'
            )}
          >
            ⏸️ Pause
          </button>
          
          <button
            onClick={resetPipeline}
            className="glass-button-secondary px-3 py-1.5 text-sm hover:scale-105"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="glass-card-minimal p-4 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Status</p>
            <p className={cn('font-medium capitalize', getStatusColor(pipelineStatus))}>
              {pipelineStatus}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Progress</p>
            <p className="font-medium text-white">{getOverallProgress().toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-400">Success Rate</p>
            <p className="font-medium text-green-400">{getSuccessRate().toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-400">Duration</p>
            <p className="font-medium text-white">
              {pipelineStartTime ? formatDuration(pipelineStartTime) : '--'}
            </p>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Agent Pipeline */}
      <div className="space-y-4">
        {agents.map((agent, index) => (
          <div key={agent.id} className="relative">
            {/* Connection Line */}
            {index > 0 && (
              <div className="absolute top-0 left-6 w-0.5 h-4 bg-gray-600 -translate-y-4" />
            )}
            
            {/* Agent Card */}
            <div
              className={cn(
                'agent-card relative transition-all duration-300',
                getStatusBackground(agent.status),
                expandedAgents.has(agent.id) && 'ring-2 ring-primary-500/30'
              )}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Agent Icon */}
                  <div className="w-10 h-10 bg-gray-700/30 rounded-lg flex items-center justify-center text-lg">
                    {agent.icon === 'file-upload' && <FileUploadAgentIcon size={24} />}
                    {agent.icon === 'data-profile' && <DataProfileAgentIcon size={24} />}
                    {agent.icon === 'planning' && <PlanningAgentIcon size={24} />}
                    {agent.icon === 'insight' && <InsightAgentIcon size={24} />}
                    {agent.icon === 'viz' && <VizAgentIcon size={24} />}
                    {agent.icon === 'critique' && <CritiqueAgentIcon size={24} />}
                    {agent.icon === 'debate' && <DebateAgentIcon size={24} />}
                    {agent.icon === 'report' && <ReportAgentIcon size={24} />}
                  </div>
                  
                  {/* Agent Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-400">{agent.description}</p>
                  </div>
                </div>
                
                {/* Status and Controls */}
                <div className="flex items-center gap-3">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getStatusIcon(agent.status)}</span>
                    <span className={cn('text-sm font-medium capitalize', getStatusColor(agent.status))}>
                      {agent.status}
                    </span>
                  </div>
                  
                  {/* Processing Indicator */}
                  {agent.status === 'processing' && (
                    <LoadingSpinner size="sm" />
                  )}
                  
                  {/* Expand Button */}
                  <button
                    onClick={() => toggleAgentExpansion(agent.id)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label={expandedAgents.has(agent.id) ? 'Collapse' : 'Expand'}
                  >
                    <svg 
                      className={cn(
                        'w-4 h-4 text-gray-400 transition-transform',
                        expandedAgents.has(agent.id) && 'rotate-180'
                      )}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              {agent.status === 'processing' && (
                <div className="mt-3">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {agent.progress}% complete
                  </p>
                </div>
              )}
              
              {/* Execution Time */}
              {agent.startTime && (
                <div className="mt-2 text-xs text-gray-400">
                  Duration: {formatDuration(agent.startTime, agent.endTime)}
                </div>
              )}
              
              {/* Expanded Content */}
              {expandedAgents.has(agent.id) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {/* Dependencies */}
                  {agent.dependencies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-300 mb-1">Dependencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.dependencies.map(depId => {
                          const depAgent = agents.find(a => a.id === depId);
                          return (
                            <span
                              key={depId}
                              className={cn(
                                'px-2 py-1 rounded text-xs',
                                depAgent?.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
                              )}
                            >
                              {depAgent?.name} {depAgent?.status === 'completed' ? '✅' : '⏳'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Logs */}
                  {(showLogs || agent.logs.length > 0) && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-300 mb-2">Logs:</p>
                      <div className="bg-gray-900/50 rounded-lg p-3 max-h-32 overflow-y-auto scrollbar-glass">
                        {agent.logs.length > 0 ? (
                          <ul className="space-y-1">
                            {agent.logs.map((log, logIndex) => (
                              <li key={`${agent.id}-log-${logIndex}`} className="text-xs text-gray-400">
                                {log}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No logs available</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="glass-button-secondary px-2 py-1 text-xs">
                      📋 View Logs
                    </button>
                    <button className="glass-button-secondary px-2 py-1 text-xs">
                      ⚙️ Settings
                    </button>
                    {agent.status === 'error' && (
                      <button className="glass-button-secondary px-2 py-1 text-xs">
                        🔄 Retry
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
