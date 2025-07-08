/**
 * File: frontend/src/features/agents/StatusIndicator.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Agent status indicator component for real-time status display
 * 
 * This component provides visual status indicators for agents with:
 * - Real-time status updates with smooth animations
 * - Color-coded status indicators (idle, running, completed, error)
 * - Tooltip information and status descriptions
 * - Consistent glassmorphism styling
 * 
 * Features:
 * - Animated status transitions
 * - Pulse effects for active states
 * - Accessibility features with ARIA labels
 * - Support for custom status types
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Agent status type definition
type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'waiting' | 'paused';

interface StatusIndicatorProps {
  /**
   * Current status of the agent
   */
  readonly status: AgentStatus;
  
  /**
   * Status indicator size
   */
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Show status label text
   */
  readonly showLabel?: boolean;
  
  /**
   * Custom status message
   */
  readonly message?: string;
  
  /**
   * Enable tooltip on hover
   */
  readonly tooltip?: boolean;
  
  /**
   * Tooltip content override
   */
  readonly tooltipContent?: string;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Click handler for interactive indicators
   */
  readonly onClick?: () => void;
}

/**
 * StatusIndicator Component
 * 
 * Visual status indicator for agents with animated transitions and
 * optional tooltips. Provides consistent status visualization across
 * the agent pipeline interface.
 * 
 * @param status - Current agent status
 * @param size - Indicator size variant
 * @param showLabel - Show status label text
 * @param message - Custom status message
 * @param tooltip - Enable tooltip display
 * @param tooltipContent - Custom tooltip content
 * @param className - Additional CSS classes
 * @param onClick - Click handler
 * @returns {JSX.Element} The status indicator component
 */
export function StatusIndicator({ 
  status,
  size = 'md',
  showLabel = false,
  message,
  tooltip = false,
  tooltipContent,
  className,
  onClick
}: StatusIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Size variant classes
  const sizeClasses = {
    sm: {
      indicator: 'w-2 h-2',
      container: 'gap-1',
      text: 'text-xs'
    },
    md: {
      indicator: 'w-3 h-3',
      container: 'gap-2',
      text: 'text-sm'
    },
    lg: {
      indicator: 'w-4 h-4',
      container: 'gap-2',
      text: 'text-base'
    },
    xl: {
      indicator: 'w-5 h-5',
      container: 'gap-3',
      text: 'text-lg'
    }
  };

  // Status configuration
  const statusConfig = {
    idle: {
      color: 'bg-gray-500',
      label: 'Idle',
      description: 'Agent is inactive and ready to start'
    },
    waiting: {
      color: 'bg-yellow-500',
      label: 'Waiting',
      description: 'Agent is waiting for input or dependencies'
    },
    running: {
      color: 'bg-blue-500 animate-pulse',
      label: 'Running',
      description: 'Agent is actively processing'
    },
    paused: {
      color: 'bg-orange-500',
      label: 'Paused',
      description: 'Agent execution has been paused'
    },
    completed: {
      color: 'bg-green-500',
      label: 'Completed',
      description: 'Agent has finished successfully'
    },
    error: {
      color: 'bg-red-500',
      label: 'Error',
      description: 'Agent encountered an error'
    }
  };

  const config = statusConfig[status];
  const isInteractive = !!onClick;

  return (
    <div className={cn(
      'relative inline-flex items-center',
      sizeClasses[size].container,
      isInteractive && 'cursor-pointer',
      className
    )}>
      {/* Status Indicator Dot */}
      <div
        className={cn(
          'rounded-full border border-white/20 transition-all duration-300',
          sizeClasses[size].indicator,
          config.color,
          isInteractive && 'hover:scale-110'
        )}
        onClick={onClick}
        onMouseEnter={tooltip ? () => setShowTooltip(true) : undefined}
        onMouseLeave={tooltip ? () => setShowTooltip(false) : undefined}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={`Agent status: ${config.label}`}
      />

      {/* Status Label */}
      {showLabel && (
        <span className={cn(
          'text-gray-400 font-medium capitalize',
          sizeClasses[size].text
        )}>
          {config.label}
        </span>
      )}

      {/* Custom Message */}
      {message && (
        <span className={cn(
          'text-gray-400',
          sizeClasses[size].text
        )}>
          {message}
        </span>
      )}

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white shadow-xl backdrop-blur-xl">
            <div className="font-medium">{config.label}</div>
            <div className="text-gray-400 text-xs">
              {tooltipContent ?? config.description}
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * StatusIndicatorGroup Component
 * 
 * Group multiple status indicators for pipeline visualization
 */
interface StatusIndicatorGroupProps {
  /**
   * Array of status configurations
   */
  readonly statuses: Array<{
    id: string;
    status: AgentStatus;
    label?: string;
    message?: string;
  }>;
  
  /**
   * Group layout orientation
   */
  readonly orientation?: 'horizontal' | 'vertical';
  
  /**
   * Indicator size for all items
   */
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Show connecting lines between indicators
   */
  readonly showConnections?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Click handler with status ID
   */
  readonly onStatusClick?: (id: string, status: AgentStatus) => void;
}

/**
 * StatusIndicatorGroup Component
 * 
 * Displays multiple status indicators in a group layout with optional
 * connecting lines for pipeline visualization.
 * 
 * @param statuses - Array of status configurations
 * @param orientation - Layout orientation
 * @param size - Indicator size
 * @param showConnections - Show connecting lines
 * @param className - Additional CSS classes
 * @param onStatusClick - Click handler
 * @returns {JSX.Element} The status indicator group
 */
export function StatusIndicatorGroup({ 
  statuses,
  orientation = 'horizontal',
  size = 'md',
  showConnections = false,
  className,
  onStatusClick
}: StatusIndicatorGroupProps) {
  return (
    <div className={cn(
      'flex items-center',
      orientation === 'vertical' && 'flex-col',
      orientation === 'horizontal' && 'flex-row',
      className
    )}>
      {statuses.map((statusItem, index) => (
        <React.Fragment key={statusItem.id}>
          <StatusIndicator
            status={statusItem.status}
            size={size}
            showLabel={!!statusItem.label}
            {...(statusItem.message !== undefined && { message: statusItem.message })}
            tooltip={true}
            {...(onStatusClick && { onClick: () => onStatusClick(statusItem.id, statusItem.status) })}
          />
          
          {/* Connection Line */}
          {showConnections && index < statuses.length - 1 && (
            <div className={cn(
              'bg-gray-600',
              orientation === 'horizontal' && 'w-4 h-px mx-2',
              orientation === 'vertical' && 'h-4 w-px my-2'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
