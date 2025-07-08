/**
 * File: unified-layout.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Unified layout component implementing the exact 3-section enterprise design
 * Project: Enterprise Insights Copilot - matches 10-frontend-home-ui-layout.txt specification
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface UnifiedLayoutProps {
  /** Header content (navigation) */
  header: ReactNode;
  /** Left column content (upload + chat) */
  leftColumn: ReactNode;
  /** Right column content (agent workflow) */
  rightColumn: ReactNode;
  /** Bottom dashboard content (full-width) */
  dashboard: ReactNode;
  /** Optional className */
  className?: string;
}

/**
 * Unified Layout Component
 * 
 * Implements the exact 3-section layout from 10-frontend-home-ui-layout.txt:
 * 1. Fixed Header Navigation (Full-Width)
 * 2. 2-Column Main Content (40% Left / 60% Right)
 * 3. Full-Width Visualization Dashboard
 * 
 * Features:
 * - Glassmorphic design system
 * - Responsive breakpoints
 * - Proper spacing and proportions
 * - Accessibility support
 */
export function UnifiedLayout({
  header,
  leftColumn,
  rightColumn,
  dashboard,
  className,
}: Readonly<UnifiedLayoutProps>) {
  return (
    <div className={cn('min-h-screen bg-gray-950', className)}>
      {/* 1. HEADER NAVIGATION (Fixed Top) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {header}
      </div>
      
      {/* Main Content Wrapper with Header Offset */}
      <div className="pt-16 min-h-screen">
        {/* 2. MAIN CONTENT AREA (True 2-Column Grid: 40% Left / 60% Right) */}
        <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
          <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 mb-8 min-h-[60vh]">
            {/* Left Column (40% Width = 2/5 columns) - Upload & Chat */}
            <div className="md:col-span-2 w-full">
              <div className="sticky top-20 space-y-8">
                {leftColumn}
              </div>
            </div>
            
            {/* Right Column (60% Width = 3/5 columns) - Agent Workflow */}
            <div className="md:col-span-3 w-full">
              <div className="sticky top-20">
                {rightColumn}
              </div>
            </div>
          </div>
        </div>
        
        {/* 3. FULL-WIDTH VISUALIZATION DASHBOARD */}
        <div className="w-full border-t border-white/10">
          {dashboard}
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div 
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '1s' }} 
        />
        <div 
          className="absolute top-1/2 left-3/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '2s' }} 
        />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
}

/**
 * Layout Section Wrapper
 * Standardized wrapper for layout sections with proper styling
 */
interface LayoutSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function LayoutSection({ 
  children, 
  className, 
  title, 
  subtitle, 
  icon 
}: Readonly<LayoutSectionProps>) {
  return (
    <section className={cn('glass-card p-6', className)}>
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {icon && (
            <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Responsive Layout Hooks
 * Utility hooks for responsive behavior
 */
export function useResponsiveLayout() {
  // This would contain responsive logic
  // For now, we'll rely on Tailwind responsive classes
  return {
    isMobile: false, // This would be dynamic
    isTablet: false,
    isDesktop: true,
  };
}
