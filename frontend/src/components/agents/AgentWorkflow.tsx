/**
 * File: AgentWorkflow.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Agent workflow component with backend integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AgentType, AgentStatus } from '@/lib/api/agentService';
import agentService from '@/lib/api/agentService';
import { GlassCard } from '@/components/ui/GlassCard';
import { AgentIcon } from '@/components/icons/AgentIcon';
import { CleanIcon } from '@/components/icons/CleanIcon';
import { TargetIcon } from '@/components/icons/TargetIcon';
import { QuestionIcon } from '@/components/icons/QuestionIcon';
import { DebateIcon } from '@/components/icons/DebateIcon';
import { SqlIcon } from '@/components/icons/SqlIcon';
import { InsightIcon } from '@/components/icons/InsightIcon';
import { CritiqueIcon } from '@/components/icons/CritiqueIcon';
import { NarrativeIcon } from '@/components/icons/NarrativeIcon';
import { ReportDocIcon } from '@/components/icons/ReportDocIcon';
import { useToast } from '@/components/providers';

/**
 * Agent information type
 */
interface AgentInfo {
  id: AgentType;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  dependencies?: AgentType[];
  status: AgentStatus;
  progress: number;
  message?: string;
}

/**
 * AgentWorkflow props
 */
interface AgentWorkflowProps {
  /** Current file ID to analyze */
  fileId?: string;
  /** Callback when all agents complete */
  onWorkflowComplete?: (results: any) => void;
}

/**
 * AgentWorkflow component with backend integration
 * Displays and manages the pipeline of data analysis agents
 */
export const AgentWorkflow: React.FC<AgentWorkflowProps> = ({
  fileId,
  onWorkflowComplete,
}) => {
  // Use toast hook for notifications
  const { addToast } = useToast();
  
  // State for tracking agent statuses and workflow state
  const [agents, setAgents] = useState<AgentInfo[]>([
    {
      id: 'data_profile',
      name: 'Data Agent',
      icon: <AgentIcon className="icon text-blue-300" aria-label="Data Agent" />,
      description: 'Data profiling and analysis',
      color: 'blue',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'file_upload',
      name: 'Cleaner Agent',
      icon: <CleanIcon className="icon text-orange-300" aria-label="Cleaner Agent" />,
      description: 'Data cleaning and preprocessing',
      color: 'orange',
      dependencies: ['data_profile'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'planning',
      name: 'Planning Agent',
      icon: <TargetIcon className="icon text-purple-300" aria-label="Planning Agent" />,
      description: 'Analysis planning and strategy',
      color: 'purple',
      dependencies: ['file_upload'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'insight',
      name: 'Query Agent',
      icon: <QuestionIcon className="icon text-blue-300" aria-label="Query Agent" />,
      description: 'Query formulation and execution',
      color: 'blue',
      dependencies: ['planning'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'debate',
      name: 'Debate Agent',
      icon: <DebateIcon className="icon text-pink-300" aria-label="Debate Agent" />,
      description: 'Multi-perspective analysis',
      color: 'pink',
      dependencies: ['insight'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'viz',
      name: 'SQL Agent',
      icon: <SqlIcon className="icon text-green-300" aria-label="SQL Agent" />,
      description: 'Database connectivity and queries',
      color: 'green',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'insight',
      name: 'Insight Agent',
      icon: <InsightIcon className="icon text-yellow-300" aria-label="Insight Agent" />,
      description: 'Pattern discovery and insights',
      color: 'yellow',
      dependencies: ['debate', 'viz'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'viz',
      name: 'Chart Agent',
      icon: <AgentIcon className="icon text-indigo-300" aria-label="Chart Agent" />,
      description: 'Data visualization generation',
      color: 'indigo',
      dependencies: ['insight'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'critique',
      name: 'Critique Agent',
      icon: <CritiqueIcon className="icon text-red-300" aria-label="Critique Agent" />,
      description: 'Quality checking and validation',
      color: 'red',
      dependencies: ['viz'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'report',
      name: 'Narrative Agent',
      icon: <NarrativeIcon className="icon text-teal-300" aria-label="Narrative Agent" />,
      description: 'Story generation from insights',
      color: 'teal',
      dependencies: ['critique'],
      status: 'idle',
      progress: 0,
    },
    {
      id: 'report',
      name: 'Report Agent',
      icon: <ReportDocIcon className="icon text-emerald-300" aria-label="Report Agent" />,
      description: 'Final report generation',
      color: 'emerald',
      dependencies: ['critique'],
      status: 'idle',
      progress: 0,
    },
  ]);
  
  // Workflow state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [workflowProgress, setWorkflowProgress] = useState<number>(0);
  const [completedAgents, setCompletedAgents] = useState<number>(0);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [agentLogs, setAgentLogs] = useState<Record<string, string[]>>({});
  
  /**
   * Initialize agents on component mount
   */
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        // Get agent statuses from backend
        const agentStatuses = await agentService.getAgentStatuses();
        
        // Update agent states
        setAgents(prevAgents => 
          prevAgents.map(agent => {
            const status = agentStatuses.find(s => s.agentType === agent.id);
            return status ? {
              ...agent,
              status: status.status,
              progress: status.progress || 0,
              message: status.message
            } : agent;
          })
        );
        
        // Check for existing workflow
        const activeWorkflows = await agentService.getActiveWorkflows();
        if (activeWorkflows.length > 0) {
          const workflow = activeWorkflows[0];
          setWorkflowId(workflow.id);
          setIsRunning(workflow.status === 'running');
          setIsPaused(workflow.status === 'paused');
          setWorkflowProgress(workflow.progress);
          setCompletedAgents(workflow.completedAgents);
        }
      } catch (error) {
        console.error('Failed to initialize agent states:', error);
      }
    };
    
    initializeAgents();
    
    // Set up polling for agent status updates
    const pollingInterval = setInterval(() => {
      if (isRunning && workflowId) {
        updateAgentStatuses(workflowId);
      }
    }, 5000);
    
    return () => clearInterval(pollingInterval);
  }, [isRunning, workflowId]);
  
  /**
   * Update agent statuses from backend
   */
  const updateAgentStatuses = async (workflowId: string) => {
    try {
      const workflowStatus = await agentService.getWorkflowStatus(workflowId);
      
      // Update agent states
      setAgents(prevAgents => 
        prevAgents.map(agent => {
          const status = workflowStatus.agentStatuses.find((s: any) => s.agentType === agent.id);
          return status ? {
            ...agent,
            status: status.status,
            progress: status.progress || 0,
            message: status.message
          } : agent;
        })
      );
      
      // Update workflow progress
      setWorkflowProgress(workflowStatus.progress);
      setCompletedAgents(workflowStatus.completedAgents);
      
      // Check if workflow is complete
      if (workflowStatus.status === 'completed') {
        setIsRunning(false);
        onWorkflowComplete?.(workflowStatus.results);
        addToast({
          type: 'success',
          title: 'Workflow Complete',
          description: 'All agents have completed their tasks successfully!'
        });
      }
      
      // Check if workflow failed
      if (workflowStatus.status === 'failed') {
        setIsRunning(false);
        addToast({
          type: 'error',
          title: 'Workflow Failed',
          description: workflowStatus.error || 'An error occurred during workflow execution.'
        });
      }
    } catch (error) {
      console.error('Failed to update agent statuses:', error);
    }
  };
  
  /**
   * Start the workflow
   */
  const handleStartWorkflow = async () => {
    if (isRunning) return;
    
    if (!fileId) {
      addToast({
        type: 'warning',
        title: 'File Required',
        description: 'Please upload a file first to start the workflow.'
      });
      return;
    }
    
    try {
      setIsRunning(true);
      setIsPaused(false);
      
      // Start workflow on backend
      const workflow = await agentService.startWorkflow({
        fileId,
        options: {
          autoRun: true,
        }
      });
      
      setWorkflowId(workflow.id);
      
      addToast({
        type: 'success',
        title: 'Workflow Started',
        description: 'The agent workflow has been initiated.'
      });
      
      // Update agent statuses
      updateAgentStatuses(workflow.id);
    } catch (error) {
      setIsRunning(false);
      console.error('Failed to start workflow:', error);
      addToast({
        type: 'error',
        title: 'Workflow Error',
        description: error instanceof Error ? error.message : 'Failed to start workflow'
      });
    }
  };
  
  /**
   * Pause the workflow
   */
  const handlePauseWorkflow = async () => {
    if (!isRunning || !workflowId) return;
    
    try {
      await agentService.pauseWorkflow(workflowId);
      setIsPaused(true);
      addToast({
        type: 'info',
        title: 'Workflow Paused',
        description: 'The agent workflow has been paused.'
      });
    } catch (error) {
      console.error('Failed to pause workflow:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to pause workflow'
      });
    }
  };
  
  /**
   * Resume the workflow
   */
  const handleResumeWorkflow = async () => {
    if (!isPaused || !workflowId) return;
    
    try {
      await agentService.resumeWorkflow(workflowId);
      setIsPaused(false);
      addToast({
        type: 'info',
        title: 'Workflow Resumed',
        description: 'The agent workflow has been resumed.'
      });
    } catch (error) {
      console.error('Failed to resume workflow:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resume workflow'
      });
    }
  };
  
  /**
   * Reset the workflow
   */
  const handleResetWorkflow = async () => {
    if (!workflowId) return;
    
    try {
      await agentService.resetWorkflow(workflowId);
      
      setIsRunning(false);
      setIsPaused(false);
      setWorkflowProgress(0);
      setCompletedAgents(0);
      setWorkflowId(null);
      
      // Reset agent states
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          status: 'idle',
          progress: 0,
          message: ''
        }))
      );
      
      addToast({
        type: 'info',
        title: 'Workflow Reset',
        description: 'The agent workflow has been reset.'
      });
    } catch (error) {
      console.error('Failed to reset workflow:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset workflow'
      });
    }
  };
  
  /**
   * View agent logs
   */
  const handleViewLogs = async (agentId: AgentType) => {
    try {
      setSelectedAgent(agentId);
      
      // Fetch logs from backend if not already loaded
      if (!agentLogs[agentId] && workflowId) {
        const logs = await agentService.getAgentLogs(workflowId, agentId);
        setAgentLogs(prev => ({
          ...prev,
          [agentId]: logs
        }));
      }
    } catch (error) {
      console.error('Failed to fetch agent logs:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to retrieve agent logs'
      });
    }
  };
  
  /**
   * Render status indicator
   */
  const renderStatusIndicator = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return <span className="text-blue-400 text-sm">🔵 Running</span>;
      case 'completed':
        return <span className="text-green-400 text-sm">🟢 Completed</span>;
      case 'failed':
        return <span className="text-red-400 text-sm">🔴 Failed</span>;
      case 'queued':
        return <span className="text-yellow-400 text-sm">🟡 Queued</span>;
      case 'cancelled':
        return <span className="text-orange-400 text-sm">🟠 Cancelled</span>;
      default:
        return <span className="text-gray-300 text-sm">⚪ Idle</span>;
    }
  };
  
  /**
   * Get border color based on agent color and status
   */
  const getBorderColor = (agent: AgentInfo) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-400/60',
      orange: 'border-orange-400/60',
      purple: 'border-purple-400/60',
      pink: 'border-pink-400/60',
      green: 'border-green-400/60',
      yellow: 'border-yellow-400/60',
      indigo: 'border-indigo-400/60',
      red: 'border-red-400/60',
      teal: 'border-teal-400/60',
      emerald: 'border-emerald-400/70',
    };
    
    return colorMap[agent.color] || 'border-blue-400/60';
  };
  
  /**
   * Format progress bar
   */
  const formatProgressBar = (progress: number) => {
    const blocks = 10;
    const filledBlocks = Math.floor((progress / 100) * blocks);
    
    return '▓'.repeat(filledBlocks) + '░'.repeat(blocks - filledBlocks);
  };
  
  return (
    <GlassCard size="lg" variant="elevated" blurIntensity="strong" className="glass-card-accent">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-lg">
          <AgentIcon className="icon text-emerald-300" aria-label="Agent Workflow" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Agent Workflow</h2>
          <p className="text-sm text-emerald-200/80">11-agent pipeline for data analysis</p>
        </div>
      </div>
      
      {/* Agent Pipeline - Vertical Layout */}
      <div className="flex flex-col space-y-4 w-full">
        {agents.map((agent, index) => (
          <div 
            key={`${agent.id}-${index}`}
            className={`glass-card-minimal p-4 border-l-4 ${getBorderColor(agent)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {agent.icon}
                </span>
                <span className="text-white font-semibold text-sm">{agent.name}</span>
              </div>
              {renderStatusIndicator(agent.status)}
            </div>
            
            <div className={`text-xs text-${agent.color}-300`}>
              Status: {agent.message || (agent.status === 'idle' ? 'Ready' : agent.status)}
            </div>
            
            {agent.progress > 0 && (
              <div className={`text-xs text-${agent.color}-200/70`}>
                Progress: {formatProgressBar(agent.progress)} {agent.progress}%
              </div>
            )}
            
            {agent.dependencies && agent.dependencies.length > 0 && (
              <div className={`text-xs text-${agent.color}-200/70`}>
                Dependencies: {agent.dependencies.join(', ')} 
                {agent.status === 'queued' && ' ❌'}
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
              <button 
                className="glass-button-secondary px-2 py-1 text-xs"
                onClick={() => handleViewLogs(agent.id)}
              >
                📋 View Logs
              </button>
              
              {agent.id === 'report' ? (
                <button 
                  className={`glass-button-secondary px-2 py-1 text-xs ${agent.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={agent.status !== 'completed'}
                  onClick={() => agentService.downloadReport(workflowId!)}
                >
                  📤 Export
                </button>
              ) : (
                <button className="glass-button-secondary px-2 py-1 text-xs">⚙️ Settings</button>
              )}
            </div>
          </div>
        ))}
        
        {/* Selected agent logs */}
        {selectedAgent && agentLogs[selectedAgent] && (
          <div className="glass-card-minimal p-4 border border-emerald-400/40 bg-emerald-950/20 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Agent Logs: {agents.find(a => a.id === selectedAgent)?.name}</h3>
              <button 
                className="text-emerald-300 hover:text-emerald-200 transition-colors"
                onClick={() => setSelectedAgent(null)}
              >
                Close
              </button>
            </div>
            <div className="bg-emerald-950/50 p-3 rounded text-emerald-100 text-sm font-mono max-h-60 overflow-y-auto custom-scrollbar">
              {agentLogs[selectedAgent].map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pipeline Controls with Enhanced Visual Hierarchy */}
        <div className="border-t border-emerald-400/30 pt-6">
          <div className="glass-card-minimal p-6 bg-emerald-500/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white font-semibold text-lg">
                  🔄 Pipeline Status: {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Ready'}
                </div>
                <div className="text-emerald-300 mt-2">
                  📊 Progress: {formatProgressBar(workflowProgress)} {workflowProgress}% 
                  ({completedAgents}/11 complete)
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              {!isRunning ? (
                <button 
                  onClick={handleStartWorkflow}
                  className="glass-button-primary px-6 py-3 text-sm bg-emerald-500/30 border-emerald-400/50 animate-glow"
                >
                  ▶️ Start Pipeline
                </button>
              ) : isPaused ? (
                <button 
                  onClick={handleResumeWorkflow}
                  className="glass-button-primary px-6 py-3 text-sm bg-emerald-500/30 border-emerald-400/50"
                >
                  ▶️ Resume
                </button>
              ) : (
                <button 
                  onClick={handlePauseWorkflow}
                  className="glass-button-secondary px-4 py-3 text-sm"
                >
                  ⏸️ Pause
                </button>
              )}
              
              <button 
                onClick={handleResetWorkflow}
                className="glass-button-secondary px-4 py-3 text-sm"
                disabled={!workflowId}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AgentWorkflow;
