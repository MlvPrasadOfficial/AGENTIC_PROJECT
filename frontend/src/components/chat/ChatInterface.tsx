/**
 * File: ChatInterface.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Chat interface component with backend integration
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import chatService, { ChatMessage } from '@/lib/api/chatService';
import { GlassCard } from '@/components/ui/GlassCard';
import { ChatIcon } from '@/components/icons/ChatIcon';
import { SendIcon } from '@/components/icons/SendIcon';
import { SuggestionIcon } from '@/components/icons/SuggestionIcon';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import { ReportIcon } from '@/components/icons/ReportIcon';
import { useToast } from '@/components/providers';

/**
 * ChatInterface props
 */
interface ChatInterfaceProps {
  /** Current file ID to analyze */
  currentFileId?: string;
  /** Conversation ID to continue (optional) */
  conversationId?: string;
  /** Callback when a message is sent */
  onMessageSent?: (message: string) => void;
  /** Callback when a response is received */
  onResponseReceived?: (message: ChatMessage) => void;
}

/**
 * ChatInterface component with backend integration
 * Handles chat messaging, history, and report generation
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentFileId,
  conversationId: initialConversationId,
  onMessageSent,
  onResponseReceived,
}) => {
  // Hook for toast notifications
  const { addToast } = useToast();
  
  // State management
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState<string>('');
  const [conversations, setConversations] = useState<{ id: string; title: string }[]>([]);
  const [reports, setReports] = useState<{ id: string; title: string }[]>([]);
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  /**
   * Load conversation history on component mount
   */
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        const history = await chatService.getConversations(5);
        setConversations(history.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title
        })));
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    };
    
    const loadReports = async () => {
      try {
        const reportsList = await chatService.getReports(5);
        setReports(reportsList.reports.map((report: any) => ({
          id: report.id,
          title: report.title
        })));
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
    };
    
    loadConversationHistory();
    loadReports();
  }, []);
  
  /**
   * Load conversation messages when conversationId changes
   */
  useEffect(() => {
    if (conversationId) {
      const loadConversationMessages = async () => {
        try {
          const conversationMessages = await chatService.getConversationMessages(conversationId);
          setMessages(conversationMessages.messages);
        } catch (error) {
          console.error('Failed to load conversation messages:', error);
          addToast({
            type: 'error',
            title: 'Error',
            description: 'Failed to load conversation history'
          });
        }
      };
      
      loadConversationMessages();
    }
  }, [conversationId]);
  
  /**
   * Scroll to bottom when messages change
   */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamedMessage]);
  
  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);
  
  /**
   * Handle message submission
   */
  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Store the message value before resetting input
    const messageText = inputValue.trim();
    
    // Reset input and set loading state
    setInputValue('');
    setIsLoading(true);
    setCurrentStreamedMessage('');
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      // Create a user message
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: conversationId || 'new',
        role: 'user',
        content: messageText,
        createdAt: new Date().toISOString()
      };
      
      // Add user message to state
      setMessages(prev => [...prev, userMessage]);
      
      // Notify parent
      onMessageSent?.(messageText);
      
      // Send message to backend
      const responsePromise = conversationId
        ? chatService.sendMessage(conversationId, messageText, currentFileId)
        : chatService.createConversation(messageText, currentFileId);
      
      // Stream response if available
      if ('streamResponse' in chatService) {
        await chatService.streamMessage(
          conversationId || 'new',
          messageText,
          currentFileId,
          (chunk: any) => {
            setCurrentStreamedMessage(prev => prev + chunk);
          }
        );
      } else {
        // Non-streaming fallback
        const response = await responsePromise;
        
        // Handle different response types
        if (conversationId) {
          // sendMessage returns ChatMessage
          setMessages(prev => [...prev, response as ChatMessage]);
          onResponseReceived?.(response as ChatMessage);
        } else {
          // createConversation returns ChatConversation
          const conversation = response as any;
          setConversationId(conversation.id);
          // For new conversations, we'll need to get the initial message separately
        }
      }
    } catch (error) {
      // Only show error if not aborted
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Chat error:', error);
        addToast({
          type: 'error',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to send message'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, conversationId, currentFileId, onMessageSent, onResponseReceived]);
  
  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
  }, []);
  
  /**
   * Cancel ongoing stream
   */
  const handleCancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Handle key press for sending messages
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);
  
  /**
   * Generate PDF report from conversation
   */
  const handleGenerateReport = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const report = await chatService.generateReport(conversationId, 'Generated Report');
      
      addToast({
        type: 'success',
        title: 'Report Generated',
        description: 'Your report has been generated successfully'
      });
      
      // Add to reports list
      setReports(prev => [
        {
          id: report.id,
          title: report.title
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Failed to generate report:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate report'
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);
  
  // Render message based on role
  const renderMessage = useCallback((message: ChatMessage) => {
    return (
      <div 
        key={message.id} 
        className={`p-4 rounded-lg my-2 ${message.role === 'user' ? 'bg-purple-500/20 ml-8' : 'bg-purple-800/20 mr-8'}`}
      >
        <div className="text-sm text-purple-300 mb-1">
          {message.role === 'user' ? 'You' : 'Copilot'}
        </div>
        <div className="text-white whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  }, []);
  
  return (
    <GlassCard size="md" variant="elevated" blurIntensity="strong" className="glass-card-secondary">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 text-lg">
          <ChatIcon className="icon text-purple-300" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Ask Copilot</h2>
          <p className="text-sm text-purple-200/80">Natural language analytics queries</p>
        </div>
      </div>
      
      {/* Messages container */}
      {(messages.length > 0 || currentStreamedMessage) && (
        <div className="max-h-60 overflow-y-auto mb-4 pr-2 custom-scrollbar">
          {messages.map(renderMessage)}
          
          {/* Streaming message */}
          {currentStreamedMessage && (
            <div className="p-4 rounded-lg my-2 bg-purple-800/20 mr-8">
              <div className="text-sm text-purple-300 mb-1">Copilot</div>
              <div className="text-white whitespace-pre-wrap">{currentStreamedMessage}</div>
            </div>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messageEndRef} />
        </div>
      )}
      
      {/* Input area */}
      <div className="space-y-4">
        <div className="border border-purple-400/20 rounded-lg p-4 bg-purple-500/5">
          <textarea 
            placeholder="Type your analytics query..." 
            className="w-full bg-transparent border-none text-white placeholder-purple-200/60 resize-none focus:outline-none"
            rows={3}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        <div className="text-right flex items-center justify-between">
          {isLoading && (
            <button 
              onClick={handleCancelStream}
              className="text-purple-300 hover:text-purple-200 text-sm"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            className={`glass-button-primary px-6 py-3 bg-purple-500/25 border-purple-400/40 hover:bg-purple-500/35 flex items-center gap-2
              ${(!inputValue.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <SendIcon className="icon text-purple-300" /> 
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </div>
      
      {/* Suggestions */}
      <div className="mt-6 space-y-3">
        <p className="text-sm text-purple-200 flex items-center gap-1">
          <SuggestionIcon className="icon text-purple-200" /> Suggestions:
        </p>
        <ul className="text-sm text-purple-200/70 space-y-2">
          <li 
            className="pl-4 border-l-2 border-purple-400/30 cursor-pointer hover:text-purple-200 hover:border-purple-400/60 transition-colors"
            onClick={() => handleSuggestionClick("Show me sales trends by region")}
          >
            • &quot;Show me sales trends by region&quot;
          </li>
          <li 
            className="pl-4 border-l-2 border-purple-400/30 cursor-pointer hover:text-purple-200 hover:border-purple-400/60 transition-colors"
            onClick={() => handleSuggestionClick("What are the top performing products?")}
          >
            • &quot;What are the top performing products?&quot;
          </li>
          <li 
            className="pl-4 border-l-2 border-purple-400/30 cursor-pointer hover:text-purple-200 hover:border-purple-400/60 transition-colors"
            onClick={() => handleSuggestionClick("Generate quarterly revenue report")}
          >
            • &quot;Generate quarterly revenue report&quot;
          </li>
        </ul>
        
        {/* History and reports */}
        <div className="mt-6 pt-4 border-t border-purple-400/20">
          <div className="flex items-center justify-between text-sm">
            <div className="text-purple-200 flex items-center gap-1 group relative">
              <HistoryIcon className="icon text-purple-200" /> 
              <span>Chat History: [{conversations.length} conversations]</span>
              
              {/* History dropdown */}
              {conversations.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-purple-900/90 backdrop-blur-md rounded-lg p-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setConversationId(conv.id)}
                      className="block w-full text-left p-2 text-purple-200 hover:bg-purple-700/40 rounded transition-colors"
                    >
                      {conv.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 items-center">
              {conversationId && (
                <button 
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                  className="text-purple-200 hover:text-purple-100 transition-colors"
                  title="Generate PDF Report"
                >
                  <ReportIcon className="icon text-purple-200" />
                </button>
              )}
              
              <div className="text-purple-200 flex items-center gap-1 group relative">
                <span>Reports: [{reports.length}]</span>
                
                {/* Reports dropdown */}
                {reports.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 bg-purple-900/90 backdrop-blur-md rounded-lg p-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    {reports.map(report => (
                      <button
                        key={report.id}
                        onClick={() => window.open(`/api/reports/${report.id}`, '_blank')}
                        className="block w-full text-left p-2 text-purple-200 hover:bg-purple-700/40 rounded transition-colors"
                      >
                        {report.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ChatInterface;
