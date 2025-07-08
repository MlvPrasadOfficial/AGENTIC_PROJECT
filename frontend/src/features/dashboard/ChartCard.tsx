/**
 * File: frontend/src/features/dashboard/ChartCard.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Individual chart card component for dashboard visualizations
 * 
 * This component provides a standardized container for charts with:
 * - Consistent glassmorphism styling and layout
 * - Chart title, description, and metadata display
 * - Interactive controls for chart manipulation
 * - Loading states and error handling
 * - Export and sharing capabilities
 * 
 * Features:
 * - Multiple chart size variants
 * - Action menu with chart controls
 * - Status indicators and data timestamps
 * - Responsive design with mobile adaptations
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  /**
   * Chart title
   */
  readonly title: string;
  
  /**
   * Chart description or subtitle
   */
  readonly description?: string;
  
  /**
   * Chart content or visualization component
   */
  readonly children: React.ReactNode;
  
  /**
   * Chart type for styling and icon display
   */
  readonly type?: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table' | 'metric';
  
  /**
   * Chart size variant
   */
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Loading state
   */
  readonly loading?: boolean;
  
  /**
   * Error state and message
   */
  readonly error?: string;
  
  /**
   * Data timestamp or last updated
   */
  readonly lastUpdated?: Date;
  
  /**
   * Enable interactive controls
   */
  readonly interactive?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Export chart data callback
   */
  readonly onExport?: () => void;
  
  /**
   * Refresh chart data callback
   */
  readonly onRefresh?: () => void;
  
  /**
   * Toggle fullscreen view callback
   */
  readonly onFullscreen?: () => void;
}

/**
 * ChartCard Component
 * 
 * Standardized container for dashboard charts and visualizations with
 * consistent styling, interactive controls, and proper error handling.
 * Provides a unified interface for all chart types within the dashboard.
 * 
 * @param title - Chart title
 * @param description - Chart description
 * @param children - Chart content/visualization
 * @param type - Chart type for styling
 * @param size - Chart size variant
 * @param loading - Loading state
 * @param error - Error message
 * @param lastUpdated - Data timestamp
 * @param interactive - Enable controls
 * @param className - Additional CSS classes
 * @param onExport - Export callback
 * @param onRefresh - Refresh callback
 * @param onFullscreen - Fullscreen callback
 * @returns {JSX.Element} The chart card component
 */
export function ChartCard({ 
  title,
  description,
  children,
  type = 'bar',
  size = 'md',
  loading = false,
  error,
  lastUpdated,
  interactive = true,
  className,
  onExport,
  onRefresh,
  onFullscreen
}: ChartCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Chart type icons
  const typeIcons = {
    bar: '📊',
    line: '📈',
    pie: '🥧',
    area: '📊',
    scatter: '🔸',
    table: '📋',
    metric: '🎯'
  };

  // Size variant classes
  const sizeClasses = {
    sm: 'min-h-[200px]',
    md: 'min-h-[300px]',
    lg: 'min-h-[400px]',
    xl: 'min-h-[500px]'
  };

  return (
    <div className={cn(
      'glass-card rounded-xl border border-white/10',
      'backdrop-blur-xl bg-black/20',
      'transition-all duration-300',
      'hover:bg-black/30 hover:border-white/20',
      sizeClasses[size],
      className
    )}>
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Chart Type Icon */}
          <span className="text-lg">{typeIcons[type]}</span>
          
          {/* Chart Info */}
          <div>
            <h4 className="text-white font-semibold">{title}</h4>
            {description && (
              <p className="text-sm text-gray-400">{description}</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        {interactive && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>

            {/* Actions Dropdown */}
            {showActions && (
              <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 min-w-[150px]">
                {onRefresh && (
                  <button
                    onClick={() => {
                      onRefresh();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Refresh Data
                  </button>
                )}
                {onExport && (
                  <button
                    onClick={() => {
                      onExport();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Export Chart
                  </button>
                )}
                {onFullscreen && (
                  <button
                    onClick={() => {
                      onFullscreen();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Fullscreen
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="p-4 flex-1">
        {loading ? (
          /* Loading State */
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading chart data...</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <div className="text-red-400 text-lg mb-2">⚠️</div>
              <p className="text-red-400 text-sm">{error}</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-2 px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Chart Content */
          <div className="w-full h-full">
            {children}
          </div>
        )}
      </div>

      {/* Chart Footer */}
      {lastUpdated && (
        <div className="px-4 py-2 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
