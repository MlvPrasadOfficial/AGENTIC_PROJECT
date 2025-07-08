/**
 * File: frontend/src/components/ui/ProgressBar.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Progress indicator component with glassmorphism styling
 * 
 * This component provides progress visualization with:
 * - Smooth animations and transitions
 * - Multiple size and style variants
 * - Glassmorphism effects and transparency
 * - Support for determinate and indeterminate states
 * 
 * Features:
 * - Customizable colors and gradients
 * - Progress percentage display
 * - Animated progress updates
 * - Accessibility features with ARIA attributes
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /**
   * Progress value (0-100)
   */
  readonly value?: number;
  
  /**
   * Maximum value (default: 100)
   */
  readonly max?: number;
  
  /**
   * Progress bar size
   */
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Progress bar color variant
   */
  readonly variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gradient';
  
  /**
   * Show percentage text
   */
  readonly showPercentage?: boolean;
  
  /**
   * Custom label text
   */
  readonly label?: string;
  
  /**
   * Indeterminate loading state
   */
  readonly indeterminate?: boolean;
  
  /**
   * Enable glassmorphism container
   */
  readonly glass?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * ARIA label for accessibility
   */
  readonly ariaLabel?: string;
}

/**
 * ProgressBar Component
 * 
 * Displays progress with smooth animations and glassmorphism styling.
 * Supports both determinate and indeterminate states with multiple
 * visual variants and accessibility features.
 * 
 * @param value - Progress value (0-100)
 * @param max - Maximum value
 * @param size - Size variant
 * @param variant - Color variant
 * @param showPercentage - Show percentage text
 * @param label - Custom label
 * @param indeterminate - Indeterminate state
 * @param glass - Enable glassmorphism
 * @param className - Additional CSS classes
 * @param ariaLabel - Accessibility label
 * @returns {JSX.Element} The progress bar component
 */
export function ProgressBar({ 
  value = 0,
  max = 100,
  size = 'md',
  variant = 'blue',
  showPercentage = false,
  label,
  indeterminate = false,
  glass = true,
  className,
  ariaLabel
}: ProgressBarProps) {
  // Calculate percentage
  const percentage = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  // Size variant classes
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  // Color variant classes
  const variantClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
  };

  // Background variant classes
  const backgroundClasses = {
    blue: 'bg-blue-500/20',
    green: 'bg-green-500/20',
    yellow: 'bg-yellow-500/20',
    red: 'bg-red-500/20',
    purple: 'bg-purple-500/20',
    gradient: 'bg-gray-500/20'
  };

  return (
    <div className={cn(
      'w-full',
      className
    )}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm text-gray-400">{label}</span>
          )}
          {showPercentage && !indeterminate && (
            <span className="text-sm text-white font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Container */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          sizeClasses[size],
          // Glass container styling
          glass && [
            'backdrop-blur-xl border border-white/10',
            backgroundClasses[variant]
          ],
          !glass && 'bg-gray-700'
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label || 'Progress'}
      >
        {/* Progress Bar */}
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            variantClasses[variant],
            // Indeterminate animation
            indeterminate && 'animate-pulse w-full',
            // Determinate width
            !indeterminate && 'rounded-full'
          )}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        >
          {/* Indeterminate sliding animation */}
          {indeterminate && (
            <div className={cn(
              'h-full w-1/3 rounded-full animate-[slide_2s_ease-in-out_infinite]',
              variantClasses[variant]
            )} />
          )}
        </div>
      </div>

      {/* Additional Info */}
      {!indeterminate && value > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {value} of {max} completed
        </div>
      )}
    </div>
  );
}

/**
 * CircularProgress Component
 * 
 * Circular progress indicator with glassmorphism styling
 */
interface CircularProgressProps {
  /**
   * Progress value (0-100)
   */
  readonly value?: number;
  
  /**
   * Circle size in pixels
   */
  readonly size?: number;
  
  /**
   * Stroke width
   */
  readonly strokeWidth?: number;
  
  /**
   * Color variant
   */
  readonly variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  
  /**
   * Show percentage in center
   */
  readonly showPercentage?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
}

/**
 * CircularProgress Component
 * 
 * Circular progress indicator for dashboard widgets and status displays.
 * 
 * @param value - Progress value (0-100)
 * @param size - Circle size in pixels
 * @param strokeWidth - Stroke width
 * @param variant - Color variant
 * @param showPercentage - Show percentage text
 * @param className - Additional CSS classes
 * @returns {JSX.Element} The circular progress component
 */
export function CircularProgress({ 
  value = 0,
  size = 120,
  strokeWidth = 8,
  variant = 'blue',
  showPercentage = true,
  className
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Color variant classes
  const colorClasses = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    yellow: 'stroke-yellow-500',
    red: 'stroke-red-500',
    purple: 'stroke-purple-500'
  };

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center',
      className
    )}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500 ease-out',
            colorClasses[variant]
          )}
        />
      </svg>
      
      {/* Percentage Text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold">
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  );
}
