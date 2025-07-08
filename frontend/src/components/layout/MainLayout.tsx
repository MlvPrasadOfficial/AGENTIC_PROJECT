/**
 * File: frontend/src/components/layout/MainLayout.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: 2-column layout wrapper component for main content areas
 * 
 * This component provides a standardized 2-column layout structure with:
 * - 40%/60% column proportions using Tailwind grid
 * - Responsive design with mobile-first approach
 * - Glassmorphism container styling
 * - Flexible content slots for left and right columns
 * 
 * Layout Structure:
 * - Mobile: Single column stack
 * - Desktop: 2-column grid (40% left, 60% right)
 * - Glass container with backdrop blur effects
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  /**
   * Content for the left column (40% width on desktop)
   * Typically used for navigation, upload, or chat interfaces
   */
  leftColumn: React.ReactNode;
  
  /**
   * Content for the right column (60% width on desktop)
   * Typically used for main content, workflows, or data displays
   */
  rightColumn: React.ReactNode;
  
  /**
   * Additional CSS classes for custom styling
   */
  className?: string;
  
  /**
   * Optional container styling variant
   */
  variant?: 'default' | 'compact' | 'wide';
}

/**
 * MainLayout Component
 * 
 * Provides a standardized 2-column layout with glassmorphism styling
 * and responsive behavior. Serves as the main content wrapper for
 * application pages requiring side-by-side content organization.
 * 
 * @param leftColumn - Content for the left column (40%)
 * @param rightColumn - Content for the right column (60%)
 * @param className - Additional CSS classes
 * @param variant - Layout variant for different use cases
 * @returns {JSX.Element} The 2-column layout structure
 */
export function MainLayout({ 
  leftColumn, 
  rightColumn, 
  className,
  variant = 'default'
}: MainLayoutProps) {
  // Variant-specific styling
  const variantClasses = {
    default: 'gap-6 p-6',
    compact: 'gap-4 p-4',
    wide: 'gap-8 p-8'
  };

  return (
    <div className={cn(
      // Base layout styles
      'w-full min-h-screen',
      // Glassmorphism container
      'glass-container backdrop-blur-xl bg-black/20',
      'border border-white/10 rounded-2xl',
      // Grid layout - responsive
      'grid grid-cols-1 lg:grid-cols-5',
      // Variant-specific spacing
      variantClasses[variant],
      className
    )}>
      {/* Left Column - 40% on desktop (2/5 columns) */}
      <div className={cn(
        'lg:col-span-2',
        'flex flex-col space-y-6',
        'min-h-full'
      )}>
        {leftColumn}
      </div>
      
      {/* Right Column - 60% on desktop (3/5 columns) */}
      <div className={cn(
        'lg:col-span-3',
        'flex flex-col space-y-6',
        'min-h-full'
      )}>
        {rightColumn}
      </div>
    </div>
  );
}
