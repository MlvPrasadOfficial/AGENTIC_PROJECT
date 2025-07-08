/**
 * File: frontend/src/features/dashboard/ChartControls.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Dashboard controls component for chart interaction and management
 * 
 * This component provides comprehensive dashboard controls with:
 * - Chart type selection and configuration
 * - Data filtering and time range selection
 * - Export and sharing functionality
 * - View mode switching (grid, list, fullscreen)
 * 
 * Features:
 * - Glassmorphism styled control panels
 * - Responsive design with mobile adaptations
 * - Real-time filter updates
 * - Keyboard shortcuts and accessibility
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChartControlsProps {
  /**
   * Available chart types for selection
   */
  readonly chartTypes?: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  
  /**
   * Current selected chart type
   */
  readonly selectedChartType?: string;
  
  /**
   * Available time ranges
   */
  readonly timeRanges?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  
  /**
   * Current selected time range
   */
  readonly selectedTimeRange?: string;
  
  /**
   * Dashboard view mode
   */
  readonly viewMode?: 'grid' | 'list' | 'fullscreen';
  
  /**
   * Enable real-time updates
   */
  readonly realTimeEnabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Chart type change callback
   */
  readonly onChartTypeChange?: (chartType: string) => void;
  
  /**
   * Time range change callback
   */
  readonly onTimeRangeChange?: (timeRange: string) => void;
  
  /**
   * View mode change callback
   */
  readonly onViewModeChange?: (viewMode: 'grid' | 'list' | 'fullscreen') => void;
  
  /**
   * Real-time toggle callback
   */
  readonly onRealTimeToggle?: (enabled: boolean) => void;
  
  /**
   * Export dashboard callback
   */
  readonly onExport?: () => void;
  
  /**
   * Refresh data callback
   */
  readonly onRefresh?: () => void;
}

/**
 * ChartControls Component
 * 
 * Comprehensive dashboard control panel providing chart type selection,
 * data filtering, view mode switching, and export functionality with
 * glassmorphism styling and responsive design.
 * 
 * @param chartTypes - Available chart types
 * @param selectedChartType - Current chart type
 * @param timeRanges - Available time ranges
 * @param selectedTimeRange - Current time range
 * @param viewMode - Dashboard view mode
 * @param realTimeEnabled - Real-time updates status
 * @param className - Additional CSS classes
 * @param onChartTypeChange - Chart type change handler
 * @param onTimeRangeChange - Time range change handler
 * @param onViewModeChange - View mode change handler
 * @param onRealTimeToggle - Real-time toggle handler
 * @param onExport - Export handler
 * @param onRefresh - Refresh handler
 * @returns {JSX.Element} The dashboard controls component
 */
export function ChartControls({ 
  chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: '📊' },
    { id: 'line', name: 'Line Chart', icon: '📈' },
    { id: 'pie', name: 'Pie Chart', icon: '🥧' },
    { id: 'area', name: 'Area Chart', icon: '📊' }
  ],
  selectedChartType = 'bar',
  timeRanges = [
    { id: '1h', label: 'Last Hour', value: '1h' },
    { id: '24h', label: 'Last 24 Hours', value: '24h' },
    { id: '7d', label: 'Last 7 Days', value: '7d' },
    { id: '30d', label: 'Last 30 Days', value: '30d' }
  ],
  selectedTimeRange = '24h',
  viewMode = 'grid',
  realTimeEnabled = false,
  className,
  onChartTypeChange,
  onTimeRangeChange,
  onViewModeChange,
  onRealTimeToggle,
  onExport,
  onRefresh
}: ChartControlsProps) {
  const [showDropdowns, setShowDropdowns] = useState<Record<string, boolean>>({});

  // Toggle dropdown visibility
  const toggleDropdown = (key: string) => {
    setShowDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // View mode icons
  const viewModeIcons = {
    grid: '⊞',
    list: '☰',
    fullscreen: '⛶'
  };

  return (
    <div className={cn(
      'glass-card p-4 rounded-xl border border-white/10',
      'backdrop-blur-xl bg-black/20',
      className
    )}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Chart Type Selector */}
        <div className="relative">
          <label className="block text-xs text-gray-400 mb-1">Chart Type</label>
          <button
            onClick={() => toggleDropdown('chartType')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-sm text-white hover:bg-gray-700/50 transition-colors"
          >
            <span>{chartTypes.find(type => type.id === selectedChartType)?.icon}</span>
            <span>{chartTypes.find(type => type.id === selectedChartType)?.name}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdowns.chartType && (
            <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 min-w-full">
              {chartTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    onChartTypeChange?.(type.id);
                    toggleDropdown('chartType');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <span>{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="relative">
          <label className="block text-xs text-gray-400 mb-1">Time Range</label>
          <button
            onClick={() => toggleDropdown('timeRange')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-sm text-white hover:bg-gray-700/50 transition-colors"
          >
            <span>{timeRanges.find(range => range.id === selectedTimeRange)?.label}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdowns.timeRange && (
            <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 min-w-full">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => {
                    onTimeRangeChange?.(range.id);
                    toggleDropdown('timeRange');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">View Mode</label>
          <div className="flex bg-gray-800/50 border border-gray-600 rounded-lg overflow-hidden">
            {(['grid', 'list', 'fullscreen'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange?.(mode)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  viewMode === mode 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                )}
              >
                {viewModeIcons[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Toggle */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Real-time</label>
          <button
            onClick={() => onRealTimeToggle?.(!realTimeEnabled)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              realTimeEnabled 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-800/50 text-gray-400 border border-gray-600 hover:bg-gray-700/50'
            )}
          >
            <div className={cn(
              'w-2 h-2 rounded-full',
              realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            )} />
            <span>{realTimeEnabled ? 'Live' : 'Paused'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Export Dashboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
