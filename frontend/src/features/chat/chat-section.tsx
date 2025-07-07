/**
 * File: chat-section.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: RAG Chat interface component for querying the analytics copilot with glassmorphic design
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  attachments?: string[];
}

interface ChatSectionProps {
  /** Whether to show suggested queries */
  showSuggestions?: boolean;
  /** Callback when message is sent */
  onMessageSent?: (message: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Chat Section Component
 * 
 * Features:
 * - Real-time chat interface
 * - Message history with timestamps
 * - Query suggestions
 * - Loading states
 * - File attachments
 * - Export conversation
 * - Glassmorphic design
 * 
 * @example
 * <ChatSection 
 *   showSuggestions={true}
 *   onMessageSent={handleMessageSent}
 * />
 */
export function ChatSection({
  showSuggestions = true,
  onMessageSent,
  className,
}: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: 'Welcome to Enterprise Insights Copilot! I can help you analyze your data, create visualizations, and generate reports. What would you like to explore?',
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Suggested queries
  const suggestedQueries = [
    'Show me sales trends by region',
    'What are the top performing products?',
    'Generate quarterly revenue report',
    'Analyze customer behavior patterns',
    'Create a dashboard for key metrics',
    'Compare year-over-year performance',
  ];
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (content: string = inputValue.trim()) => {
    if (!content || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    
    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Call callback
    if (onMessageSent) {
      onMessageSent(content);
    }
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `ai-loading-${Date.now()}`,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Simulate AI response
    try {
      const response = await simulateAIResponse(content);
      
      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              ...msg,
              content: response,
              isLoading: false,
            }
          : msg
      ));
      
      setConversationCount(prev => prev + 1);
    } catch (error) {
      // Handle error
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              ...msg,
              content: 'I apologize, but I encountered an error processing your request. Please try again.',
              isLoading: false,
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simulate AI response
  const simulateAIResponse = async (query: string): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Generate contextual response based on query
    const responses = {
      sales: 'Based on your data analysis, I found significant sales trends across different regions. The Northeast region shows a 15% increase compared to last quarter, while the West Coast maintains steady growth at 8%. Here are the key insights:\n\n• Q3 sales peaked in August with $2.4M revenue\n• Top performing product categories: Electronics (32%), Software (28%)\n• Customer acquisition cost decreased by 12%\n\nWould you like me to create a detailed visualization of these trends?',
      
      product: 'I\'ve analyzed your product performance data and identified the top performers:\n\n1. **Premium Software Suite** - $1.2M revenue (18% growth)\n2. **Mobile Analytics Platform** - $980K revenue (25% growth)\n3. **Enterprise Dashboard** - $750K revenue (8% growth)\n\nKey factors driving performance:\n• Higher customer retention (85%)\n• Improved user engagement metrics\n• Successful feature releases\n\nShall I generate a comprehensive product performance report?',
      
      report: 'I\'ll generate a comprehensive quarterly revenue report for you. This will include:\n\n✅ Executive Summary with key metrics\n✅ Revenue breakdown by product/region\n✅ Year-over-year comparison charts\n✅ Customer acquisition analysis\n✅ Forecasting for next quarter\n\nThe report is being compiled by our Report Agent and will be available for download shortly. You\'ll be notified when it\'s ready.',
      
      default: 'I understand you\'re looking for insights from your data. I can help you with:\n\n• **Data Analysis**: Explore trends, patterns, and correlations\n• **Visualizations**: Create charts, graphs, and dashboards\n• **Reports**: Generate comprehensive business reports\n• **Forecasting**: Predict future trends based on historical data\n\nTo provide more specific insights, could you please upload your data files or ask a more specific question about what you\'d like to analyze?'
    };
    
    // Determine response type based on query content
    const queryLower = query.toLowerCase();
    if (queryLower.includes('sales') || queryLower.includes('revenue') || queryLower.includes('trend')) {
      return responses.sales;
    } else if (queryLower.includes('product') || queryLower.includes('perform')) {
      return responses.product;
    } else if (queryLower.includes('report') || queryLower.includes('quarterly')) {
      return responses.report;
    } else {
      return responses.default;
    }
  };
  
  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };
  
  // Clear conversation
  const clearConversation = () => {
    setMessages([{
      id: 'welcome-new',
      type: 'ai',
      content: 'Conversation cleared. How can I help you with your data analysis today?',
      timestamp: new Date(),
    }]);
    setConversationCount(0);
  };
  
  // Export conversation
  const exportConversation = () => {
    const conversation = messages
      .filter(msg => !msg.isLoading)
      .map(msg => `${msg.type.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Chat Section Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Ask Copilot</h2>
              <p className="text-sm text-gray-400">
                Natural language analytics queries
              </p>
            </div>
          </div>
          
          {/* Chat Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportConversation}
              className="glass-button-secondary px-3 py-1.5 text-sm"
              disabled={messages.length <= 1}
            >
              📤 Export
            </button>
            <button
              onClick={clearConversation}
              className="glass-button-secondary px-3 py-1.5 text-sm"
              disabled={messages.length <= 1}
            >
              🗑️ Clear
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="glass-card-minimal p-4 h-80 overflow-y-auto scrollbar-glass">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] p-3 rounded-lg',
                    message.type === 'user'
                      ? 'bg-primary-500/20 border border-primary-500/30 text-white'
                      : 'bg-gray-700/20 border border-gray-600/30 text-gray-100'
                  )}
                >
                  {/* Message Content */}
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Message Input */}
        <div className="mt-4">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your analytics query..."
              className="glass-input flex-1 resize-none min-h-[44px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                'glass-button-primary px-4 py-2 min-w-[80px]',
                (!inputValue.trim() || isLoading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Suggested Queries */}
        {showSuggestions && messages.length <= 1 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-300 mb-3">💡 Suggestions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQueries.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="glass-card p-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <span className="text-blue-400 mr-2">•</span>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat Statistics */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>📜 Chat History: {conversationCount} conversations</span>
              <span>💬 Messages: {messages.filter(m => !m.isLoading).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Connected</span>
            </div>
          </div>
        </div>
        
        {/* Report Download Section */}
        {conversationCount > 0 && (
          <div className="mt-4 glass-card-minimal p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-white">Report Ready: Q3-Analysis.pdf</span>
              </div>
              <button className="glass-button-primary px-3 py-1 text-sm">
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
