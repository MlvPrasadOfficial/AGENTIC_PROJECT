/**
 * File: websocketService.ts
 * Author: GitHub Copilot
 * Date: 2025-07-11
 * Purpose: WebSocket service for real-time communication with agent workflow
 */

import { v4 as uuidv4 } from 'uuid';

export interface AgentUpdate {
  type: 'agent_update';
  agent_name: string;
  status: 'processing' | 'completed' | 'error';
  data?: any;
  timestamp: string;
}

export interface WorkflowMessage {
  type: 'workflow_started' | 'workflow_completed' | 'connection_established' | 'error' | 'ping' | 'pong';
  data?: any;
  timestamp: string;
  session_id?: string;
}

export type WebSocketMessage = AgentUpdate | WorkflowMessage;

export interface WebSocketServiceOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private baseUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private autoReconnect: boolean;
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private pingInterval: number | null = null;

  constructor(options: WebSocketServiceOptions = {}) {
    this.sessionId = uuidv4();
    this.baseUrl = process.env.NODE_ENV === 'development' ? 'ws://localhost:8000' : `ws://${window.location.host}`;
    this.autoReconnect = options.autoReconnect ?? true;
    this.reconnectInterval = options.reconnectInterval ?? 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.baseUrl}/api/v1/ws/ws/${this.sessionId}`;
        console.log(`Connecting to WebSocket: ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startPing();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.stopPing();
          
          if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect().catch(console.error);
            }, this.reconnectInterval);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.autoReconnect = false;
    this.stopPing();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send message to WebSocket
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Start agent workflow
   */
  startWorkflow(query: string): void {
    this.send({
      type: 'start_workflow',
      query,
      session_id: this.sessionId
    });
  }

  /**
   * Get current status
   */
  getStatus(): void {
    this.send({
      type: 'get_status',
      session_id: this.sessionId
    });
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(messageType: string, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }
    
    this.listeners.get(messageType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(messageType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(messageType);
        }
      }
    };
  }

  /**
   * Subscribe to agent updates
   */
  subscribeToAgentUpdates(callback: (update: AgentUpdate) => void): () => void {
    return this.subscribe('agent_update', callback as (message: WebSocketMessage) => void);
  }

  /**
   * Subscribe to workflow events
   */
  subscribeToWorkflowEvents(callback: (event: WorkflowMessage) => void): () => void {
    const unsubscribeFns = [
      this.subscribe('workflow_started', callback as (message: WebSocketMessage) => void),
      this.subscribe('workflow_completed', callback as (message: WebSocketMessage) => void),
      this.subscribe('error', callback as (message: WebSocketMessage) => void)
    ];

    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('WebSocket message received:', message);
    
    // Notify specific type listeners
    const typeListeners = this.listeners.get(message.type);
    if (typeListeners) {
      typeListeners.forEach(callback => callback(message));
    }

    // Notify general listeners
    const generalListeners = this.listeners.get('*');
    if (generalListeners) {
      generalListeners.forEach(callback => callback(message));
    }
  }

  /**
   * Start ping to keep connection alive
   */
  private startPing(): void {
    this.pingInterval = window.setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get session ID
   */
  get getSessionId(): string {
    return this.sessionId;
  }
}

// Global instance
export const websocketService = new WebSocketService();

export default websocketService;
