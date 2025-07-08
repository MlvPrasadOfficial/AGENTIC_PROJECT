/**
 * File: frontend/src/features/chat/MessageBubble.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Individual message bubble component for chat interface
 * 
 * This component provides message display functionality with:
 * - Sender-based styling and positioning
 * - Message type indicators and status display
 * - Timestamp formatting and display
 * - Interactive features like copy and reply
 * 
 * Features:
 * - Glassmorphism styling with sender-based colors
 * - Smooth animations and transitions
 * - Accessibility features with proper ARIA labels
 * - Support for different message types (text, code, data, error)
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Message type definition
interface MessageBubbleProps {
  /**
   * Unique message identifier
   */
  readonly id: string;
  
  /**
   * Message content text
   */
  readonly content: string;
  
  /**
   * Message sender type
   */
  readonly sender: 'user' | 'ai' | 'system';
  
  /**
   * Message timestamp
   */
  readonly timestamp: Date;
  
  /**
   * Message type for styling
   */
  readonly type?: 'text' | 'code' | 'data' | 'error';
  
  /**
   * Message status (for sent messages)
   */
  readonly status?: 'sending' | 'sent' | 'delivered' | 'failed';
  
  /**
   * Message attachments
   */
  readonly attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  
  /**
   * Enable interactive features
   */
  readonly interactive?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Copy message callback
   */
  readonly onCopy?: (content: string) => void;
  
  /**
   * Reply to message callback
   */
  readonly onReply?: (messageId: string) => void;
  
  /**
   * Delete message callback
   */
  readonly onDelete?: (messageId: string) => void;
}

/**
 * MessageBubble Component
 * 
 * Individual message display component with sender-based styling,
 * interactive features, and proper accessibility. Supports multiple
 * message types and provides smooth animations.
 * 
 * @param id - Message identifier
 * @param content - Message content
 * @param sender - Message sender type
 * @param timestamp - Message timestamp
 * @param type - Message type for styling
 * @param status - Message delivery status
 * @param attachments - Message attachments
 * @param interactive - Enable interactive features
 * @param className - Additional CSS classes
 * @param onCopy - Copy message handler
 * @param onReply - Reply message handler
 * @param onDelete - Delete message handler
 * @returns {JSX.Element} The message bubble component
 */
export function MessageBubble({ 
  id,
  content,
  sender,
  timestamp,
  type = 'text',
  status,
  attachments,
  interactive = true,
  className,
  onCopy,
  onReply,
  onDelete
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle copy message
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.(content);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // Sender-based styling
  const getSenderStyling = () => {
    switch (sender) {
      case 'user':
        return {
          container: 'ml-auto max-w-[80%]',
          bubble: 'bg-blue-500/20 border-blue-500/30 text-blue-100',
          alignment: 'items-end'
        };
      case 'ai':
        return {
          container: 'mr-auto max-w-[80%]',
          bubble: 'bg-purple-500/20 border-purple-500/30 text-purple-100',
          alignment: 'items-start'
        };
      case 'system':
        return {
          container: 'mx-auto max-w-[60%]',
          bubble: 'bg-gray-500/20 border-gray-500/30 text-gray-300',
          alignment: 'items-center'
        };
      default:
        return {
          container: 'mr-auto max-w-[80%]',
          bubble: 'bg-gray-500/20 border-gray-500/30 text-gray-300',
          alignment: 'items-start'
        };
    }
  };

  // Message type styling
  const getTypeStyling = () => {
    switch (type) {
      case 'code':
        return 'font-mono text-sm bg-black/30 border-l-4 border-l-green-500';
      case 'data':
        return 'border-l-4 border-l-blue-500';
      case 'error':
        return 'border-l-4 border-l-red-500 bg-red-500/10';
      default:
        return '';
    }
  };

  // Message type icon
  const getTypeIcon = () => {
    switch (type) {
      case 'code': return '💻';
      case 'data': return '📊';
      case 'error': return '⚠️';
      default: return null;
    }
  };

  // Status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'sent':
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
      case 'delivered':
        return <div className="w-3 h-3 bg-green-400 rounded-full" />;
      case 'failed':
        return <div className="w-3 h-3 bg-red-400 rounded-full" />;
      default:
        return null;
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const styling = getSenderStyling();

  return (
    <div className={cn(
      'flex flex-col',
      styling.alignment,
      className
    )}>
      <div
        className={cn(
          'relative group',
          styling.container
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Message Bubble */}
        <div className={cn(
          'p-3 rounded-lg border backdrop-blur-xl transition-all duration-200',
          'hover:shadow-lg hover:shadow-black/10',
          styling.bubble,
          getTypeStyling()
        )}>
          {/* Message Header */}
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon() && (
              <span className="text-sm">{getTypeIcon()}</span>
            )}
            <span className="text-xs opacity-75">
              {formatTimestamp(timestamp)}
            </span>
            {status && getStatusIcon() && (
              <div className="ml-auto">{getStatusIcon()}</div>
            )}
          </div>

          {/* Message Content */}
          <div className={cn(
            'whitespace-pre-wrap break-words',
            type === 'code' && 'overflow-x-auto'
          )}>
            {content}
          </div>

          {/* Message Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/10"
                >
                  <span className="text-sm">📎</span>
                  <span className="text-sm flex-1">{attachment.name}</span>
                  <button
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Actions */}
        {interactive && showActions && (
          <div className={cn(
            'absolute top-0 flex items-center gap-1 transition-opacity duration-200',
            sender === 'user' ? 'right-full mr-2' : 'left-full ml-2'
          )}>
            {onCopy && (
              <button
                onClick={handleCopy}
                className="p-1 bg-gray-800 border border-white/10 rounded text-gray-400 hover:text-white transition-colors"
                title={copied ? 'Copied!' : 'Copy message'}
              >
                {copied ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
            
            {onReply && sender !== 'user' && (
              <button
                onClick={() => onReply(id)}
                className="p-1 bg-gray-800 border border-white/10 rounded text-gray-400 hover:text-white transition-colors"
                title="Reply to message"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            )}
            
            {onDelete && sender === 'user' && (
              <button
                onClick={() => onDelete(id)}
                className="p-1 bg-gray-800 border border-white/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                title="Delete message"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
