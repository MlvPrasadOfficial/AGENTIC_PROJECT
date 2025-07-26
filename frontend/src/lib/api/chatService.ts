/**
 * File: chatService.ts
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Chat and conversation service for Enterprise Insights Copilot
 * 
 * This module provides functionality for chat conversations, message history,
 * and chat-based interactions with the AI system.
 */

import apiClient from './apiClient';
import { AgentType } from './agentService';

/**
 * Message role in a conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message structure
 */
export interface ChatMessage {
  /** Unique message ID */
  id: string;
  /** Conversation ID */
  conversationId: string;
  /** Message role */
  role: MessageRole;
  /** Message content */
  content: string;
  /** Creation timestamp */
  createdAt: string;
  /** Agent that generated this message (for assistant messages) */
  sourceAgent?: AgentType;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Chat conversation structure
 */
export interface ChatConversation {
  /** Unique conversation ID */
  id: string;
  /** Conversation title */
  title: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Last message */
  lastMessage?: ChatMessage;
}

/**
 * Conversation messages response
 */
export interface ConversationMessagesResponse {
  /** Conversation details */
  conversation: ChatConversation;
  /** Messages in the conversation */
  messages: ChatMessage[];
  /** Pagination info */
  pagination: {
    /** Total messages count */
    total: number;
    /** Has more messages */
    hasMore: boolean;
    /** Next page cursor */
    nextCursor?: string;
  };
}

/**
 * Report structure
 */
export interface Report {
  /** Unique report ID */
  id: string;
  /** Report title */
  title: string;
  /** Report description */
  description?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Report file URL */
  fileUrl: string;
  /** Report size in bytes */
  size: number;
  /** Related conversation ID */
  conversationId?: string;
  /** Related file ID */
  fileId?: string;
}

/**
 * Chat Service for Enterprise Insights Copilot
 * 
 * Provides methods for chat conversations, message history,
 * and interactions with the AI system.
 */
class ChatService {
  /**
   * Get a list of chat conversations
   * 
   * @param limit - Number of conversations to retrieve
   * @param cursor - Pagination cursor
   * @returns Promise resolving to the list of conversations
   */
  async getConversations(limit = 10, cursor?: string): Promise<{
    conversations: ChatConversation[];
    pagination: {
      total: number;
      hasMore: boolean;
      nextCursor?: string;
    };
  }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const response = await apiClient.get(`/conversations?${params.toString()}`);
    return response.data;
  }
  
  /**
   * Get a specific conversation by ID
   * 
   * @param conversationId - The conversation ID
   * @returns Promise resolving to the conversation
   */
  async getConversation(conversationId: string): Promise<ChatConversation> {
    const response = await apiClient.get<ChatConversation>(`/conversations/${conversationId}`);
    return response.data;
  }
  
  /**
   * Get messages for a conversation
   * 
   * @param conversationId - The conversation ID
   * @param limit - Number of messages to retrieve
   * @param cursor - Pagination cursor
   * @returns Promise resolving to the conversation messages
   */
  async getConversationMessages(
    conversationId: string, 
    limit = 50, 
    cursor?: string
  ): Promise<ConversationMessagesResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const response = await apiClient.get<ConversationMessagesResponse>(
      `/conversations/${conversationId}/messages?${params.toString()}`
    );
    return response.data;
  }
  
  /**
   * Create a new conversation (chat session)
   * 
   * @param title - Conversation title (not used by backend, kept for compatibility)
   * @param fileId - Optional file ID to associate with the conversation
   * @returns Promise resolving to the created conversation
   */
  async createConversation(title: string, fileId?: string): Promise<ChatConversation> {
    const response = await apiClient.post<any>('/chat/sessions');
    
    // Convert backend ChatSession to frontend ChatConversation format
    return {
      id: response.data.session_id,
      title: title || 'New Conversation',
      createdAt: response.data.created_at,
      updatedAt: response.data.created_at
    };
  }
  
  /**
   * Delete a conversation
   * 
   * @param conversationId - The conversation ID
   * @returns Promise resolving when the conversation is deleted
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/conversations/${conversationId}`);
  }
  
  /**
   * Send a message to a conversation
   * 
   * @param conversationId - The conversation ID (session_id in backend)
   * @param content - Message content
   * @param fileId - Optional file ID for data-related queries
   * @returns Promise resolving to the created message
   */
  async sendMessage(
    conversationId: string, 
    content: string,
    fileId?: string
  ): Promise<ChatMessage> {
    const response = await apiClient.post<any>(`/chat/sessions/${conversationId}/messages`, {
      message: content,
      file_id: fileId,
      use_rag: true,
      stream: false
    });
    
    // Convert backend ChatResponse to frontend ChatMessage format
    const backendMessage = response.data.message;
    return {
      id: backendMessage.message_id,
      conversationId: backendMessage.session_id,
      role: backendMessage.role,
      content: backendMessage.content,
      createdAt: backendMessage.timestamp,
      metadata: backendMessage.metadata
    };
  }
  
  /**
   * Get stream of responses for a message
   * 
   * @param conversationId - The conversation ID
   * @param messageContent - User message content
   * @param fileId - Optional file ID for data-related queries
   * @param onChunk - Callback for each chunk of the streamed response
   * @returns Promise resolving to the complete message
   */
  async streamMessage(
    conversationId: string,
    messageContent: string,
    fileId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatMessage> {
    // First send the user message
    const userMessage = await this.sendMessage(conversationId, messageContent, fileId);
    
    // Set up streaming request
    const response = await fetch(`${apiClient.baseUrl}/conversations/${conversationId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        // Add auth header if needed
        ...(localStorage.getItem('auth_token') ? {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } : {})
      },
      body: JSON.stringify({
        messageId: userMessage.id,
        fileId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Stream error: ${response.status} ${response.statusText}`);
    }
    
    // Handle SSE stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let completeMessage = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE events from the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.substring(5).trim();
          if (data === '[DONE]') continue;
          
          try {
            const chunk = JSON.parse(data);
            if (chunk.content) {
              completeMessage += chunk.content;
              onChunk?.(chunk.content);
            }
          } catch (e) {
            console.error('Error parsing SSE data', e);
          }
        }
      }
    }
    
    // Return the constructed complete message
    return {
      id: `response-${userMessage.id}`,
      conversationId,
      role: 'assistant',
      content: completeMessage,
      createdAt: new Date().toISOString(),
      sourceAgent: 'debate'
    };
  }
  
  /**
   * Get list of available reports
   * 
   * @param limit - Number of reports to retrieve
   * @param cursor - Pagination cursor
   * @returns Promise resolving to the list of reports
   */
  async getReports(limit = 10, cursor?: string): Promise<{
    reports: Report[];
    pagination: {
      total: number;
      hasMore: boolean;
      nextCursor?: string;
    };
  }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const response = await apiClient.get(`/reports?${params.toString()}`);
    return response.data;
  }
  
  /**
   * Get a specific report
   * 
   * @param reportId - The report ID
   * @returns Promise resolving to the report
   */
  async getReport(reportId: string): Promise<Report> {
    const response = await apiClient.get<Report>(`/reports/${reportId}`);
    return response.data;
  }
  
  /**
   * Generate a new report from a conversation
   * 
   * @param conversationId - The conversation ID
   * @param title - Report title
   * @returns Promise resolving to the generated report
   */
  async generateReport(conversationId: string, title: string): Promise<Report> {
    const response = await apiClient.post<Report>('/reports/generate', {
      conversationId,
      title
    });
    return response.data;
  }
  
  /**
   * Delete a report
   * 
   * @param reportId - The report ID
   * @returns Promise resolving when the report is deleted
   */
  async deleteReport(reportId: string): Promise<void> {
    await apiClient.delete(`/reports/${reportId}`);
  }
  
  /**
   * Get suggested queries based on the current file and context
   * 
   * @param fileId - The file ID
   * @param count - Number of suggestions to retrieve
   * @returns Promise resolving to the list of suggestions
   */
  async getSuggestions(fileId: string, count = 3): Promise<string[]> {
    const response = await apiClient.get<{ suggestions: string[] }>(
      `/suggestions?fileId=${fileId}&count=${count}`
    );
    return response.data.suggestions;
  }
}

// Create and export the chat service instance
const chatService = new ChatService();
export default chatService;
