/**
 * File: agentService.ts
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Agent workflow service for Enterprise Insights Copilot
 * 
 * This module provides functionality for interacting with the agent workflow API,
 * including executing agents, checking status, and retrieving results.
 */

import apiClient from './apiClient';

/**
 * Agent types in the workflow
 */
export type AgentType = 
  | 'file_upload' 
  | 'data_profile' 
  | 'planning' 
  | 'insight' 
  | 'viz' 
  | 'critique' 
  | 'debate' 
  | 'report';

/**
 * Agent execution status
 */
export type AgentStatus = 
  | 'idle' 
  | 'queued' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

/**
 * Agent execution parameters
 */
export interface AgentExecutionParams {
  /** Agent type to execute */
  agentType: AgentType;
  /** File ID for data-related agents */
  fileId?: string;
  /** User query for planning agent */
  query?: string;
  /** Additional parameters for the agent */
  parameters?: Record<string, any>;
}

/**
 * Agent execution status response
 */
export interface AgentExecutionStatus {
  /** Unique execution ID */
  executionId: string;
  /** Agent type */
  agentType: AgentType;
  /** Current status */
  status: AgentStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current execution step */
  currentStep?: string;
  /** Completed steps */
  stepsCompleted?: string[];
  /** Execution time in seconds */
  executionTime?: number;
  /** Last update timestamp */
  updatedAt: string;
  /** Error details if status is 'failed' */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Detailed error info */
    details?: any;
  };
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult<T = any> {
  /** Unique execution ID */
  executionId: string;
  /** Agent type */
  agentType: AgentType;
  /** Execution status */
  status: AgentStatus;
  /** Result data */
  results: T;
  /** Completion timestamp */
  completedAt?: string;
}

/**
 * Agent type information
 */
export interface AgentTypeInfo {
  /** Agent type ID */
  type: AgentType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Agent capabilities */
  capabilities: string[];
  /** Estimated execution time range */
  estimatedTime: string;
}

/**
 * Agent log entry
 */
export interface AgentLogEntry {
  /** Log timestamp */
  timestamp: string;
  /** Log level */
  level: 'debug' | 'info' | 'warning' | 'error';
  /** Log message */
  message: string;
  /** Agent type */
  agentType: AgentType;
  /** Execution ID */
  executionId: string;
  /** Additional log data */
  data?: any;
}

/**
 * Agent Service for Enterprise Insights Copilot
 * 
 * Provides methods for interacting with the agent workflow system.
 */
class AgentService {
  /**
   * Execute an agent in the workflow
   * 
   * @param params - Agent execution parameters
   * @returns Promise resolving to the agent execution status
   */
  async executeAgent(params: AgentExecutionParams): Promise<AgentExecutionStatus> {
    const response = await apiClient.post<AgentExecutionStatus>('/agents/execute', params);
    return response.data;
  }
  
  /**
   * Get current status of an agent execution
   * 
   * @param executionId - The execution ID
   * @returns Promise resolving to the agent execution status
   */
  async getExecutionStatus(executionId: string): Promise<AgentExecutionStatus> {
    const response = await apiClient.get<AgentExecutionStatus>(`/agents/status/${executionId}`);
    return response.data;
  }
  
  /**
   * Get the results of an agent execution
   * 
   * @param executionId - The execution ID
   * @returns Promise resolving to the agent execution result
   */
  async getExecutionResults<T = any>(executionId: string): Promise<AgentExecutionResult<T>> {
    const response = await apiClient.get<AgentExecutionResult<T>>(`/agents/results/${executionId}`);
    return response.data;
  }
  
  /**
   * Get logs for an agent execution
   * 
   * @param executionId - The execution ID
   * @returns Promise resolving to the agent logs
   */
  async getExecutionLogs(executionId: string): Promise<AgentLogEntry[]> {
    const response = await apiClient.get<AgentLogEntry[]>(`/agents/logs/${executionId}`);
    return response.data;
  }
  
  /**
   * Cancel an agent execution
   * 
   * @param executionId - The execution ID
   * @returns Promise resolving when the execution is cancelled
   */
  async cancelExecution(executionId: string): Promise<void> {
    await apiClient.post(`/agents/cancel/${executionId}`);
  }
  
  /**
   * Get a list of available agent types
   * 
   * @returns Promise resolving to the list of agent types
   */
  async getAgentTypes(): Promise<AgentTypeInfo[]> {
    const response = await apiClient.get<{ agent_types: AgentTypeInfo[] }>('/agents/types');
    return response.data.agent_types;
  }
  
  /**
   * Execute the file upload agent
   * 
   * @param fileId - The ID of the uploaded file
   * @returns Promise resolving to the agent execution status
   */
  async executeFileUploadAgent(fileId: string): Promise<AgentExecutionStatus> {
    return this.executeAgent({
      agentType: 'file_upload',
      fileId,
      parameters: { processFile: true }
    });
  }
  
  /**
   * Execute the data profile agent
   * 
   * @param fileId - The ID of the uploaded file
   * @returns Promise resolving to the agent execution status
   */
  async executeDataProfileAgent(fileId: string): Promise<AgentExecutionStatus> {
    return this.executeAgent({
      agentType: 'data_profile',
      fileId,
      parameters: { 
        includeStatistics: true,
        includeDataQuality: true
      }
    });
  }
  
  /**
   * Execute the planning agent
   * 
   * @param fileId - The ID of the uploaded file
   * @param query - The user query to process
   * @returns Promise resolving to the agent execution status
   */
  async executePlanningAgent(fileId: string, query: string): Promise<AgentExecutionStatus> {
    return this.executeAgent({
      agentType: 'planning',
      fileId,
      query,
      parameters: { enableLogging: true }
    });
  }
  
  /**
   * Execute a full agent workflow for a query
   * 
   * @param fileId - The ID of the uploaded file
   * @param query - The user query to process
   * @returns Promise resolving to the final agent execution status
   */
  async executeFullWorkflow(fileId: string, query: string): Promise<AgentExecutionStatus> {
    // First make sure data profile exists
    const profileStatus = await this.executeDataProfileAgent(fileId);
    if (profileStatus.status === 'failed') {
      throw new Error('Data profile failed: ' + profileStatus.error?.message);
    }
    
    // Execute planning agent to determine next steps
    const planStatus = await this.executePlanningAgent(fileId, query);
    if (planStatus.status === 'failed') {
      throw new Error('Planning failed: ' + planStatus.error?.message);
    }
    
    // Get planning results to determine next agent
    const planResults = await this.getExecutionResults<{ route: 'insight' | 'viz' }>(planStatus.executionId);
    
    // Execute insight or viz agent based on planning
    const nextAgentType = planResults.results.route;
    const nextAgentStatus = await this.executeAgent({
      agentType: nextAgentType,
      fileId,
      query,
      parameters: { source: planStatus.executionId }
    });
    
    if (nextAgentStatus.status === 'failed') {
      throw new Error(`${nextAgentType} agent failed: ` + nextAgentStatus.error?.message);
    }
    
    // Execute critique agent
    const critiqueStatus = await this.executeAgent({
      agentType: 'critique',
      fileId,
      query,
      parameters: { 
        sourceAgentType: nextAgentType,
        sourceExecutionId: nextAgentStatus.executionId
      }
    });
    
    if (critiqueStatus.status === 'failed') {
      throw new Error('Critique failed: ' + critiqueStatus.error?.message);
    }
    
    // Execute debate agent
    const debateStatus = await this.executeAgent({
      agentType: 'debate',
      fileId,
      query,
      parameters: {
        sourceExecutionId: nextAgentStatus.executionId,
        critiqueExecutionId: critiqueStatus.executionId
      }
    });
    
    if (debateStatus.status === 'failed') {
      throw new Error('Debate failed: ' + debateStatus.error?.message);
    }
    
    // Execute report agent
    const reportStatus = await this.executeAgent({
      agentType: 'report',
      fileId,
      query,
      parameters: {
        includeExecutions: [
          planStatus.executionId,
          nextAgentStatus.executionId,
          critiqueStatus.executionId,
          debateStatus.executionId
        ]
      }
    });
    
    return reportStatus;
  }
  
  /**
   * Get status of all agents (placeholder method)
   */
  async getAgentStatuses(): Promise<any[]> {
    console.warn('getAgentStatuses not implemented');
    return [];
  }
  
  /**
   * Get active workflows (placeholder method)
   */
  async getActiveWorkflows(): Promise<any[]> {
    console.warn('getActiveWorkflows not implemented');
    return [];
  }
  
  /**
   * Get workflow status (placeholder method)
   */
  async getWorkflowStatus(_workflowId: string): Promise<any> {
    console.warn('getWorkflowStatus not implemented');
    return { agentStatuses: [] };
  }
  
  /**
   * Start workflow (placeholder method)
   */
  async startWorkflow(_params: any): Promise<any> {
    console.warn('startWorkflow not implemented');
    return { id: 'mock-workflow-id' };
  }
  
  /**
   * Pause workflow (placeholder method)
   */
  async pauseWorkflow(_workflowId: string): Promise<void> {
    console.warn('pauseWorkflow not implemented');
  }
  
  /**
   * Resume workflow (placeholder method)
   */
  async resumeWorkflow(_workflowId: string): Promise<void> {
    console.warn('resumeWorkflow not implemented');
  }
  
  /**
   * Reset workflow (placeholder method)
   */
  async resetWorkflow(_workflowId: string): Promise<void> {
    console.warn('resetWorkflow not implemented');
  }
  
  /**
   * Get agent logs (placeholder method)
   */
  async getAgentLogs(_workflowId: string, _agentId: string): Promise<any[]> {
    console.warn('getAgentLogs not implemented');
    return [];
  }
  
  /**
   * Download report (placeholder method)
   */
  async downloadReport(_workflowId: string): Promise<void> {
    console.warn('downloadReport not implemented');
  }
  
  /**
   * Get workflow visualizations (placeholder method)
   */
  async getWorkflowVisualizations(_workflowId: string): Promise<any[]> {
    console.warn('getWorkflowVisualizations not implemented');
    return [];
  }
}

// Create and export the agent service instance
const agentService = new AgentService();
export default agentService;
