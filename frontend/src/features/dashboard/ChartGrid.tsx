/**
 * File: frontend/src/features/dashboard/ChartGrid.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Chart layout grid component for organizing dashboard visualizations
 * 
 * This component provides a flexible grid system for dashboard charts with:
 * - Responsive grid layout with multiple column configurations
 * - Auto-sizing chart containers with glassmorphism styling
 * - Support for different chart types and sizes
 * - Drag-and-drop reordering capabilities (future enhancement)
 * 
 * Features:
 * - Adaptive grid based on screen size
 * - Consistent spacing and glassmorphism effects
 * - Chart placeholder support for loading states
 * - Flexible chart arrangement options
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ChartGridProps {
  /**
   * Chart components or content to display in the grid
   */
  readonly children: React.ReactNode;
  
  /**
   * Grid layout configuration
   */
  readonly layout?: 'auto' | 'equal' | 'masonry' | 'custom';
  
  /**
   * Number of columns for different screen sizes
   */
  readonly columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Gap size between chart cards
   */
  readonly gap?: 'sm' | 'md' | 'lg';
  
  /**
   * Enable glassmorphism container
   */
  readonly glassContainer?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
}

/**
 * ChartGrid Component
 * 
 * Provides a responsive grid layout system for organizing dashboard charts
 * and visualizations with consistent spacing and glassmorphism styling.
 * Supports multiple layout configurations and responsive behavior.
 * 
 * @param children - Chart components to display in the grid
 * @param layout - Grid layout type (auto, equal, masonry, custom)
 * @param columns - Column configuration for different screen sizes
 * @param gap - Spacing between grid items
 * @param glassContainer - Enable glassmorphism container styling
 * @param className - Additional CSS classes
 * @returns {JSX.Element} The chart grid layout component
 */
export function ChartGrid({ 
  children,
  layout = 'auto',
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  glassContainer = true,
  className
}: ChartGridProps) {
  // Gap size classes
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8'
  };

  // Layout-specific classes
  const layoutClasses = {
    auto: 'grid-flow-row auto-rows-fr',
    equal: 'grid-flow-row auto-rows-fr',
    masonry: 'grid-flow-row auto-rows-min',
    custom: 'grid-flow-row'
  };

  // Responsive column classes
  const getColumnClasses = () => {
    const { sm = 1, md = 2, lg = 3, xl = 4 } = columns;
    return cn(
      `grid-cols-${sm}`,
      `md:grid-cols-${md}`,
      `lg:grid-cols-${lg}`,
      `xl:grid-cols-${xl}`
    );
  };

  return (
    <div className={cn(
      // Base container
      'w-full',
      // Glassmorphism container (optional)
      glassContainer && [
        'glass-container p-6 rounded-2xl',
        'backdrop-blur-xl bg-black/20 border border-white/10'
      ],
      className
    )}>
      {/* Grid Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Dashboard Overview
        </h3>
        <p className="text-sm text-gray-400">
          Real-time data visualization and analytics
        </p>
      </div>

      {/* Chart Grid */}
      <div className={cn(
        // Base grid setup
        'grid w-full',
        // Column configuration
        getColumnClasses(),
        // Gap between items
        gapClasses[gap],
        // Layout-specific classes
        layoutClasses[layout],
        // Ensure proper grid item sizing
        'items-start'
      )}>
        {children}
      </div>
    </div>
  );
}

/**
 * ChartGridItem Component
 * 
 * Individual grid item wrapper for charts with consistent styling
 * and optional glassmorphism effects.
 */
interface ChartGridItemProps {
  /**
   * Chart content
   */
  readonly children: React.ReactNode;
  
  /**
   * Grid item span configuration
   */
  readonly span?: {
    cols?: number;
    rows?: number;
  };
  
  /**
   * Item height variant
   */
  readonly height?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Enable glassmorphism styling
   */
  readonly glass?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
}

/**
 * ChartGridItem Component
 * 
 * Wrapper component for individual charts within the grid system.
 * Provides consistent styling and optional span configurations.
 * 
 * @param children - Chart content
 * @param span - Grid span configuration
 * @param height - Item height variant
 * @param glass - Enable glassmorphism styling
 * @param className - Additional CSS classes
 * @returns {JSX.Element} The chart grid item wrapper
 */
export function ChartGridItem({ 
  children,
  span,
  height = 'auto',
  glass = true,
  className
}: ChartGridItemProps) {
  // Height variant classes
  const heightClasses = {
    auto: 'h-auto',
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80',
    xl: 'h-96'
  };

  // Span classes
  const spanClasses = span ? [
    span.cols && `col-span-${span.cols}`,
    span.rows && `row-span-${span.rows}`
  ].filter(Boolean) : [];

  return (
    <div className={cn(
      // Base grid item
      'w-full',
      // Height configuration
      heightClasses[height],
      // Span configuration
      spanClasses,
      // Glassmorphism styling (optional)
      glass && [
        'glass-card p-4 rounded-xl',
        'backdrop-blur-xl bg-black/20 border border-white/10'
      ],
      className
    )}>
      {children}
    </div>
  );
}
