/**
 * File: visualization-dashboard.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Full-width visualization dashboard component with interactive charts and glassmorphic design
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data: any[];
  config?: any;
  lastUpdated: Date;
}

interface VisualizationDashboardProps {
  /** Whether charts auto-refresh */
  autoRefresh?: boolean;
  /** Refresh interval in seconds */
  refreshInterval?: number;
  /** Custom className */
  className?: string;
}

/**
 * Visualization Dashboard Component
 * 
 * Features:
 * - Interactive chart grid
 * - Multiple chart types support
 * - Real-time data updates
 * - Export functionality
 * - Fullscreen mode
 * - Responsive layout
 * - Empty states
 * - Glassmorphic design
 * 
 * @example
 * <VisualizationDashboard 
 *   autoRefresh={true}
 *   refreshInterval={30}
 * />
 */
export function VisualizationDashboard({
  autoRefresh = true,
  refreshInterval = 30,
  className,
}: VisualizationDashboardProps) {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Sample chart data for demonstration
  const sampleCharts: ChartData[] = [
    {
      id: 'revenue-trend',
      title: 'Revenue Trends',
      type: 'line',
      data: [
        { month: 'Jan', revenue: 45000, target: 50000 },
        { month: 'Feb', revenue: 52000, target: 50000 },
        { month: 'Mar', revenue: 48000, target: 50000 },
        { month: 'Apr', revenue: 61000, target: 55000 },
        { month: 'May', revenue: 58000, target: 55000 },
        { month: 'Jun', revenue: 67000, target: 60000 },
      ],
      lastUpdated: new Date(),
    },
    {
      id: 'sales-by-region',
      title: 'Sales by Region',
      type: 'bar',
      data: [
        { region: 'North', sales: 120000, growth: 12 },
        { region: 'South', sales: 98000, growth: 8 },
        { region: 'East', sales: 145000, growth: 15 },
        { region: 'West', sales: 110000, growth: 5 },
      ],
      lastUpdated: new Date(),
    },
    {
      id: 'product-distribution',
      title: 'Product Distribution',
      type: 'pie',
      data: [
        { product: 'Software', value: 35, color: '#3b82f6' },
        { product: 'Hardware', value: 25, color: '#8b5cf6' },
        { product: 'Services', value: 20, color: '#10b981' },
        { product: 'Support', value: 20, color: '#f59e0b' },
      ],
      lastUpdated: new Date(),
    },
    {
      id: 'performance-metrics',
      title: 'Performance Metrics',
      type: 'area',
      data: [
        { date: '2024-01', users: 1200, sessions: 3400, conversion: 2.4 },
        { date: '2024-02', users: 1400, sessions: 3800, conversion: 2.8 },
        { date: '2024-03', users: 1100, sessions: 3200, conversion: 2.1 },
        { date: '2024-04', users: 1600, sessions: 4200, conversion: 3.2 },
        { date: '2024-05', users: 1800, sessions: 4800, conversion: 3.5 },
        { date: '2024-06', users: 2000, sessions: 5200, conversion: 3.8 },
      ],
      lastUpdated: new Date(),
    },
  ];
  
  // Load sample data
  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true);
    setTimeout(() => {
      setCharts(sampleCharts);
      setHasData(true);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !hasData) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, hasData]);
  
  // Refresh data
  const refreshData = () => {
    setLastRefresh(new Date());
    // In a real app, this would fetch new data from the API
    console.log('Refreshing chart data...');
  };
  
  // Get chart icon
  const getChartIcon = (type: ChartData['type']) => {
    switch (type) {
      case 'bar': return '📊';
      case 'line': return '📈';
      case 'pie': return '🥧';
      case 'area': return '📉';
      case 'scatter': return '🔵';
      default: return '📊';
    }
  };
  
  // Export chart
  const exportChart = (chartId: string, format: 'png' | 'svg' | 'pdf') => {
    console.log(`Exporting chart ${chartId} as ${format}`);
    // In a real app, this would generate and download the chart
  };
  
  // Toggle fullscreen
  const toggleFullscreen = (chartId?: string) => {
    setSelectedChart(chartId || null);
    setIsFullscreen(!!chartId);
  };
  
  // Render chart placeholder
  const renderChartPlaceholder = (chart: ChartData) => {
    const baseHeight = 'h-64';
    
    return (
      <div className={cn('glass-card p-6', baseHeight)}>
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getChartIcon(chart.type)}</span>
            <h3 className="font-semibold text-white">{chart.title}</h3>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportChart(chart.id, 'png')}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Export as PNG"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <button
              onClick={() => toggleFullscreen(chart.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Chart Visualization Area */}
        <div className="h-40 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center justify-center relative">
          {/* Chart Type Indicator */}
          <div className="text-center">
            <div className="text-4xl mb-2">{getChartIcon(chart.type)}</div>
            <p className="text-sm text-gray-400 capitalize">{chart.type} Chart</p>
            <p className="text-xs text-gray-500 mt-1">
              {chart.data.length} data points
            </p>
          </div>
          
          {/* Mock Chart Elements */}
          {chart.type === 'bar' && (
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-around">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary-500/50 rounded-t"
                  style={{
                    height: `${Math.random() * 60 + 20}px`,
                    width: '20px',
                  }}
                />
              ))}
            </div>
          )}
          
          {chart.type === 'line' && (
            <div className="absolute inset-4 flex items-center">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <polyline
                  points="10,40 25,30 40,35 55,20 70,25 85,15"
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}
          
          {chart.type === 'pie' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-emerald-500 opacity-50" />
            </div>
          )}
        </div>
        
        {/* Chart Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>Updated: {chart.lastUpdated.toLocaleTimeString()}</span>
          <span className="capitalize">{chart.type}</span>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className={cn('glass-card p-8', className)}>
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-gray-400">Preparing your data visualizations...</p>
        </div>
      </div>
    );
  }
  
  if (!hasData) {
    return (
      <div className={cn('glass-card p-8', className)}>
        <div className="text-center">
          {/* Empty State Icon */}
          <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          {/* Empty State Content */}
          <h2 className="text-xl font-semibold text-white mb-2">No Data Available</h2>
          <p className="text-gray-400 mb-6">
            Upload data files and ask questions to see visualizations here.
          </p>
          
          {/* CTA Button */}
          <button
            onClick={() => {
              // Scroll to upload section
              const uploadSection = document.querySelector('[data-upload-section]');
              uploadSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="glass-button-primary px-6 py-3"
          >
            Upload Data to Get Started
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Dashboard Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Visualization Dashboard</h2>
            <p className="text-sm text-gray-400">
              Interactive charts and analytics
            </p>
          </div>
          
          {/* Dashboard Controls */}
          <div className="flex items-center gap-3">
            {/* Auto-refresh Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Auto-refresh:</label>
              <button
                onClick={() => setLastRefresh(new Date())}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative',
                  autoRefresh ? 'bg-primary-500' : 'bg-gray-600'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 bg-white rounded-full transition-transform absolute top-1',
                    autoRefresh ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
            
            {/* Export All */}
            <button
              onClick={() => console.log('Export all charts')}
              className="glass-button-secondary px-3 py-1.5 text-sm"
            >
              📤 Export All
            </button>
            
            {/* Settings */}
            <button
              onClick={() => console.log('Open dashboard settings')}
              className="glass-button-secondary px-3 py-1.5 text-sm"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Active Charts</p>
            <p className="font-medium text-white">{charts.length}</p>
          </div>
          <div>
            <p className="text-gray-400">Last Updated</p>
            <p className="font-medium text-white">{lastRefresh.toLocaleTimeString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Data Points</p>
            <p className="font-medium text-white">
              {charts.reduce((total, chart) => total + chart.data.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <div key={chart.id}>
            {renderChartPlaceholder(chart)}
          </div>
        ))}
      </div>
      
      {/* Fullscreen Modal */}
      {isFullscreen && selectedChart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal w-full max-w-4xl h-full max-h-[80vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {charts.find(c => c.id === selectedChart)?.title}
              </h2>
              <button
                onClick={() => toggleFullscreen()}
                className="glass-button-secondary p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Fullscreen Chart */}
            <div className="h-full bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {getChartIcon(charts.find(c => c.id === selectedChart)?.type || 'bar')}
                </div>
                <h3 className="text-xl text-white mb-2">Fullscreen Chart View</h3>
                <p className="text-gray-400">Interactive chart would be rendered here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
