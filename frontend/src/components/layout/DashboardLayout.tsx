/**
 * File: frontend/src/components/layout/DashboardLayout.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Full-width dashboard layout component for data visualization
 * 
 * This component provides a specialized layout for dashboard content with:
 * - Full-width container maximizing screen real estate
 * - Glassmorphism styling with enhanced backdrop effects
 * - Flexible grid system for chart and widget arrangement
 * - Responsive design with mobile adaptations
 * 
 * Features:
 * - Auto-sizing content areas
 * - Built-in spacing and padding standards
 * - Support for header, content, and footer sections
 * - Optimized for data visualization components
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  /**
   * Optional header content for dashboard title and controls
   */
  readonly header?: React.ReactNode;
  
  /**
   * Main dashboard content - charts, widgets, data displays
   */
  readonly children: React.ReactNode;
  
  /**
   * Optional footer content for dashboard actions or summary
   */
  readonly footer?: React.ReactNode;
  
  /**
   * Additional CSS classes for custom styling
   */
  readonly className?: string;
  
  /**
   * Dashboard layout variant for different use cases
   */
  readonly variant?: 'default' | 'fullscreen' | 'compact';
  
  /**
   * Enable/disable glassmorphism effects
   */
  readonly glassEffect?: boolean;
}

/**
 * DashboardLayout Component
 * 
 * Specialized layout component for dashboard and data visualization content.
 * Provides full-width container with optimal spacing and glassmorphism styling
 * for charts, widgets, and analytical interfaces.
 * 
 * @param header - Optional header section with title and controls
 * @param children - Main dashboard content area
 * @param footer - Optional footer section with actions
 * @param className - Additional CSS classes
 * @param variant - Layout variant (default, fullscreen, compact)
 * @param glassEffect - Enable glassmorphism styling
 * @returns {JSX.Element} The full-width dashboard layout
 */
export function DashboardLayout({ 
  header,
  children, 
  footer,
  className,
  variant = 'default',
  glassEffect = true
}: DashboardLayoutProps) {
  // Variant-specific styling
  const variantClasses = {
    default: 'p-6 gap-6',
    fullscreen: 'p-2 gap-4 h-screen',
    compact: 'p-4 gap-4'
  };

  return (
    <div className={cn(
      // Base layout styles
      'w-full min-h-full',
      // Conditional glassmorphism
      glassEffect && [
        'glass-container backdrop-blur-xl bg-black/20',
        'border border-white/10 rounded-2xl'
      ],
      // Flex layout for header/content/footer
      'flex flex-col',
      // Variant-specific spacing
      variantClasses[variant],
      className
    )}>
      {/* Dashboard Header */}
      {header && (
        <div className={cn(
          'flex-shrink-0',
          'border-b border-white/10 pb-4 mb-4'
        )}>
          {header}
        </div>
      )}
      
      {/* Main Dashboard Content */}
      <div className={cn(
        'flex-1',
        'w-full',
        // Auto-grid for dashboard widgets
        'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
        // Ensure content doesn't overflow
        'overflow-hidden'
      )}>
        {children}
      </div>
      
      {/* Dashboard Footer */}
      {footer && (
        <div className={cn(
          'flex-shrink-0',
          'border-t border-white/10 pt-4 mt-4'
        )}>
          {footer}
        </div>
      )}
    </div>
  );
}
