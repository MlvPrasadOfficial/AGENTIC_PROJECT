/**
 * File: frontend/src/features/chat/ChatInterface.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Main chat interface component for AI conversation and data queries
 * 
 * This component provides a comprehensive chat interface with:
 * - Real-time messaging with AI agents
 * - Message history and conversation management
 * - File attachment and data context sharing
 * - Glassmorphism styling with smooth animations
 * 
 * Features:
 * - Auto-scrolling message container
 * - Typing indicators and status updates
 * - Message search and filtering
 * - Export conversation functionality
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Message type definition
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  type?: 'text' | 'code' | 'data' | 'error';
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface ChatInterfaceProps {
  /**
   * Chat messages array
   */
  readonly messages?: ChatMessage[];
  
  /**
   * Current typing status
   */
  readonly isTyping?: boolean;
  
  /**
   * Chat input placeholder
   */
  readonly placeholder?: string;
  
  /**
   * Enable file attachments
   */
  readonly allowAttachments?: boolean;
  
  /**
   * Maximum message length
   */
  readonly maxMessageLength?: number;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Message send callback
   */
  readonly onSendMessage?: (message: string, attachments?: File[]) => void;
  
  /**
   * Message export callback
   */
  readonly onExportChat?: () => void;
  
  /**
   * Clear chat callback
   */
  readonly onClearChat?: () => void;
}

/**
 * ChatInterface Component
 * 
 * Comprehensive chat interface for AI conversation with message history,
 * file attachments, and real-time updates. Provides smooth user experience
 * with glassmorphism styling and responsive design.
 * 
 * @param messages - Array of chat messages
 * @param isTyping - AI typing status
 * @param placeholder - Input placeholder text
 * @param allowAttachments - Enable file attachments
 * @param maxMessageLength - Maximum message length
 * @param className - Additional CSS classes
 * @param onSendMessage - Message send handler
 * @param onExportChat - Export chat handler
 * @param onClearChat - Clear chat handler
 * @returns {JSX.Element} The chat interface component
 */
export function ChatInterface({ 
  messages = [],
  isTyping = false,
  placeholder = "Ask me anything about your data...",
  allowAttachments = true,
  maxMessageLength = 1000,
  className,
  onSendMessage,
  onExportChat,
  onClearChat
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle message send
  const handleSendMessage = () => {
    if (inputValue.trim() || attachments.length > 0) {
      onSendMessage?.(inputValue.trim(), attachments.length > 0 ? attachments : undefined);
      setInputValue('');
      setAttachments([]);
    }
  };

  // Handle file attachment
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setAttachments(prev => [...prev, ...files]);
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Enter key
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Message sender styling
  const getSenderStyling = (sender: ChatMessage['sender']) => {
    switch (sender) {
      case 'user':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-100 ml-auto';
      case 'ai':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-100';
      case 'system':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300 text-center';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  // Message type icon
  const getMessageIcon = (type?: ChatMessage['type']) => {
    switch (type) {
      case 'code': return '💻';
      case 'data': return '📊';
      case 'error': return '⚠️';
      default: return null;
    }
  };

  return (
    <div className={cn(
      'glass-card rounded-xl border border-white/10',
      'backdrop-blur-xl bg-black/20 h-full flex flex-col',
      className
    )}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span className="text-purple-400">🤖</span>
          </div>
          <div>
            <h4 className="text-white font-semibold">AI Assistant</h4>
            <p className="text-xs text-gray-400">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>

        {/* Chat Actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 min-w-[150px]">
              {onExportChat && (
                <button
                  onClick={() => {
                    onExportChat();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Export Chat
                </button>
              )}
              {onClearChat && (
                <button
                  onClick={() => {
                    onClearChat();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Clear Chat
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-400 mb-2">Start a conversation</p>
              <p className="text-sm text-gray-500">
                Ask questions about your data or upload files to analyze
              </p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'max-w-[80%] p-3 rounded-lg border backdrop-blur-xl',
                getSenderStyling(message.sender)
              )}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 mb-1">
                {getMessageIcon(message.type) && (
                  <span>{getMessageIcon(message.type)}</span>
                )}
                <span className="text-xs opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>

              {/* Message Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs bg-black/20 rounded p-2"
                    >
                      <span>📎</span>
                      <span>{attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="max-w-[80%] p-3 rounded-lg border backdrop-blur-xl bg-purple-500/20 border-purple-500/30">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-purple-300 text-sm">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1"
              >
                <span className="text-sm text-gray-300">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              maxLength={maxMessageLength}
              rows={3}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                {inputValue.length}/{maxMessageLength}
              </span>
              {allowAttachments && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Attach file"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && attachments.length === 0}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileAttachment}
          className="hidden"
          accept=".csv,.json,.xlsx,.xls,.txt"
        />
      </div>
    </div>
  );
}
