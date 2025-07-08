/**
 * File: VisualizationDashboard.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Data visualization dashboard with D3.js integration
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GlassCard } from '@/components/ui/GlassCard';
import { BarChartIcon } from '@/components/icons/BarChartIcon';
import { PieChartIcon } from '@/components/icons/PieChartIcon';
import { LineChartIcon } from '@/components/icons/LineChart';
import { TableIcon } from '@/components/icons/TableIcon';
import { TrendIcon } from '@/components/icons/TrendIcon';
import { agentService } from '@/lib/api/agentService';
import { Toast } from '@/components/ui/Toast';

/**
 * Chart configuration
 */
interface ChartConfig {
  /** Chart type */
  type: 'bar' | 'line' | 'pie' | 'area' | 'table';
  /** Chart title */
  title: string;
  /** Data source (query or file ID) */
  dataSource: string;
  /** Chart dimensions */
  dimensions: {
    /** Chart width */
    width: number;
    /** Chart height */
    height: number;
  };
  /** Chart options */
  options: Record<string, any>;
}

/**
 * Chart data with metadata
 */
interface ChartData {
  /** Chart ID */
  id: string;
  /** Chart title */
  title: string;
  /** Chart type */
  type: 'bar' | 'line' | 'pie' | 'area' | 'table';
  /** Chart data series */
  series: Array<{
    /** Series name */
    name: string;
    /** Data points */
    data: Array<{
      /** X-axis value */
      x: string | number;
      /** Y-axis value */
      y: number;
      /** Additional metadata */
      meta?: Record<string, any>;
    }>;
    /** Series color */
    color?: string;
  }>;
  /** Chart creation timestamp */
  createdAt: string;
}

/**
 * VisualizationDashboard props
 */
interface VisualizationDashboardProps {
  /** Current file ID to visualize */
  fileId?: string;
  /** Workflow ID for retrieving results */
  workflowId?: string;
  /** Whether to show the data table */
  showDataTable?: boolean;
}

/**
 * VisualizationDashboard component
 * Displays interactive data visualizations created by the agent workflow
 */
export const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({
  fileId,
  workflowId,
  showDataTable = true,
}) => {
  // State for charts and data
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'charts' | 'table'>('charts');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  
  // Chart container refs
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  
  /**
   * Load charts when workflow ID changes
   */
  useEffect(() => {
    if (workflowId) {
      loadCharts(workflowId);
    }
  }, [workflowId]);
  
  /**
   * Load sample data when file ID changes
   */
  useEffect(() => {
    if (fileId && showDataTable) {
      loadSampleData(fileId);
    }
  }, [fileId, showDataTable]);
  
  /**
   * Load charts from workflow results
   */
  const loadCharts = async (workflowId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get visualizations from agent service
      const visualizations = await agentService.getWorkflowVisualizations(workflowId);
      setCharts(visualizations);
      
    } catch (error) {
      console.error('Failed to load visualizations:', error);
      setError('Failed to load visualizations. Please try again.');
      
      Toast({
        type: 'error',
        title: 'Visualization Error',
        message: error instanceof Error ? error.message : 'Failed to load visualizations'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load sample data from file
   */
  const loadSampleData = async (fileId: string) => {
    try {
      // Get sample data from file service
      const fileService = (await import('@/lib/api/fileService')).default;
      const sampleData = await fileService.getSampleData(fileId);
      
      // Extract column names
      if (sampleData.columns) {
        setTableColumns(sampleData.columns.map(col => col.name));
      }
      
      // Set table data
      setTableData(sampleData.rows || []);
      
    } catch (error) {
      console.error('Failed to load sample data:', error);
      
      Toast({
        type: 'error',
        title: 'Data Load Error',
        message: error instanceof Error ? error.message : 'Failed to load data preview'
      });
    }
  };
  
  /**
   * Render charts when the charts state changes
   */
  useEffect(() => {
    if (charts.length === 0 || !chartsContainerRef.current) return;
    
    // Clear existing charts
    d3.select(chartsContainerRef.current).selectAll('.chart-container').remove();
    
    // Render each chart
    charts.forEach((chart, index) => {
      const chartContainer = d3.select(chartsContainerRef.current)
        .append('div')
        .attr('class', 'chart-container mb-8 p-4 bg-blue-900/20 rounded-lg')
        .attr('id', `chart-${chart.id}`);
      
      // Add chart title
      chartContainer.append('h3')
        .attr('class', 'text-white text-lg mb-4')
        .text(chart.title);
      
      // Create chart element
      const chartElement = chartContainer.append('div')
        .attr('class', 'chart-element w-full h-64');
      
      // Render chart based on type
      switch (chart.type) {
        case 'bar':
          renderBarChart(chartElement.node()!, chart);
          break;
        case 'line':
          renderLineChart(chartElement.node()!, chart);
          break;
        case 'pie':
          renderPieChart(chartElement.node()!, chart);
          break;
        case 'area':
          renderAreaChart(chartElement.node()!, chart);
          break;
        default:
          console.warn(`Unsupported chart type: ${chart.type}`);
      }
    });
  }, [charts]);
  
  /**
   * Render a bar chart using D3
   */
  const renderBarChart = (element: HTMLElement, chart: ChartData) => {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;
    
    // Extract data
    const data = chart.series[0]?.data || [];
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.x.toString()))
      .range([0, width])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) || 0])
      .nice()
      .range([height, 0]);
    
    // Create SVG
    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('fill', '#e2e8f0');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#e2e8f0');
    
    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.x.toString()) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.y))
      .attr('height', d => height - y(d.y))
      .attr('fill', chart.series[0]?.color || '#60a5fa')
      .attr('opacity', 0.8);
    
    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .text('Category');
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .text('Value');
  };
  
  /**
   * Render a line chart using D3
   */
  const renderLineChart = (element: HTMLElement, chart: ChartData) => {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;
    
    // Extract data
    const data = chart.series[0]?.data || [];
    
    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => d.x.toString()))
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) || 0])
      .nice()
      .range([height, 0]);
    
    // Create line generator
    const line = d3.line<any>()
      .x(d => x(d.x.toString()) || 0)
      .y(d => y(d.y));
    
    // Create SVG
    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('fill', '#e2e8f0');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#e2e8f0');
    
    // Add line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', chart.series[0]?.color || '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.x.toString()) || 0)
      .attr('cy', d => y(d.y))
      .attr('r', 4)
      .attr('fill', '#f3f4f6')
      .attr('stroke', chart.series[0]?.color || '#8b5cf6');
    
    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .text('Time');
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .text('Value');
  };
  
  /**
   * Render a pie chart using D3
   */
  const renderPieChart = (element: HTMLElement, chart: ChartData) => {
    const width = element.clientWidth;
    const height = element.clientHeight;
    const radius = Math.min(width, height) / 2;
    
    // Extract data
    const data = chart.series[0]?.data || [];
    
    // Create color scale
    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.x.toString()))
      .range(d3.schemeCategory10);
    
    // Create pie generator
    const pie = d3.pie<any>()
      .value(d => d.y)
      .sort(null);
    
    // Create arc generator
    const arc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius * 0.8);
    
    // Create label arc
    const labelArc = d3.arc<any>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);
    
    // Create SVG
    const svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    
    // Add slices
    const slices = svg.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');
    
    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.x.toString()))
      .attr('opacity', 0.8);
    
    // Add labels
    slices.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .text(d => `${d.data.x}: ${d.data.y}`);
  };
  
  /**
   * Render an area chart using D3
   */
  const renderAreaChart = (element: HTMLElement, chart: ChartData) => {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;
    
    // Extract data
    const data = chart.series[0]?.data || [];
    
    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => d.x.toString()))
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) || 0])
      .nice()
      .range([height, 0]);
    
    // Create area generator
    const area = d3.area<any>()
      .x(d => x(d.x.toString()) || 0)
      .y0(height)
      .y1(d => y(d.y));
    
    // Create SVG
    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('fill', '#e2e8f0');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#e2e8f0');
    
    // Add area
    svg.append('path')
      .datum(data)
      .attr('fill', chart.series[0]?.color || '#3b82f6')
      .attr('opacity', 0.3)
      .attr('d', area);
    
    // Add line
    const line = d3.line<any>()
      .x(d => x(d.x.toString()) || 0)
      .y(d => y(d.y));
    
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', chart.series[0]?.color || '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.x.toString()) || 0)
      .attr('cy', d => y(d.y))
      .attr('r', 3)
      .attr('fill', '#f3f4f6');
    
    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .text('Time');
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .text('Value');
  };
  
  /**
   * Render data table
   */
  const renderDataTable = () => {
    if (tableData.length === 0 || tableColumns.length === 0) {
      return (
        <div className="p-8 text-center text-blue-300">
          No data available for preview. Please upload a file first.
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-blue-200">
          <thead className="text-xs text-blue-100 uppercase bg-blue-900/30">
            <tr>
              {tableColumns.map((column, index) => (
                <th key={index} className="px-6 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(0, 100).map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="border-b border-blue-900/20 hover:bg-blue-900/20"
              >
                {tableColumns.map((column, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`} className="px-6 py-2">
                    {row[column]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.length > 100 && (
          <div className="text-center text-blue-300 mt-4">
            Showing first 100 rows of {tableData.length} total rows.
          </div>
        )}
      </div>
    );
  };
  
  return (
    <GlassCard size="xl" variant="elevated" blurIntensity="strong" className="glass-card-dashboard w-full">
      <div className="flex items-center gap-3 mb-6">
        <BarChartIcon className="icon text-blue-300 text-2xl" aria-label="Visualization" title="Visualization" />
        <h2 className="text-xl font-semibold text-white">Visualization Dashboard</h2>
      </div>
      
      {/* Tab navigation */}
      {showDataTable && (
        <div className="flex border-b border-blue-800/40 mb-6">
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'charts' 
              ? 'text-blue-300 border-b-2 border-blue-500 font-medium' 
              : 'text-blue-200/60 hover:text-blue-300'}`}
            onClick={() => setActiveTab('charts')}
          >
            <BarChartIcon className="icon mr-1 inline" /> Charts
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'table' 
              ? 'text-blue-300 border-b-2 border-blue-500 font-medium' 
              : 'text-blue-200/60 hover:text-blue-300'}`}
            onClick={() => setActiveTab('table')}
          >
            <TableIcon className="icon mr-1 inline" /> Data Table
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg text-red-300 mb-6">
          {error}
        </div>
      )}
      
      {/* Charts view */}
      {activeTab === 'charts' && !isLoading && (
        <div>
          {charts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 text-blue-300 text-lg">No visualizations available yet</div>
              <p className="text-blue-200/70">
                Upload a file and run the agent workflow to generate visualizations.
              </p>
            </div>
          ) : (
            <div className="charts-grid" ref={chartsContainerRef}></div>
          )}
        </div>
      )}
      
      {/* Data table view */}
      {activeTab === 'table' && !isLoading && renderDataTable()}
    </GlassCard>
  );
};

export default VisualizationDashboard;
