/**
 * File: loading-spinner.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Glassmorphic loading spinner component with multiple sizes and animations
 */

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Size variant of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom className for additional styling */
  className?: string;
  /** Color variant for the spinner */
  variant?: 'primary' | 'white' | 'gray';
  /** Whether to show a pulsing animation */
  pulse?: boolean;
  /** Optional label for accessibility */
  label?: string;
}

/**
 * Glassmorphic Loading Spinner Component
 * 
 * Features:
 * - Multiple size variants (sm, md, lg, xl)
 * - Color variants (primary, white, gray)
 * - Optional pulsing animation
 * - Accessibility support with ARIA labels
 * - Glassmorphism styling integration
 * 
 * @example
 * <LoadingSpinner size="lg" variant="primary" />
 * <LoadingSpinner size="sm" pulse label="Loading data..." />
 */
export function LoadingSpinner({
  size = 'md',
  className,
  variant = 'primary',
  pulse = false,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  // Size mappings for consistent styling
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-3',
  };
  
  // Color variant mappings
  const variantClasses = {
    primary: 'border-gray-600 border-t-primary-500',
    white: 'border-gray-600 border-t-white',
    gray: 'border-gray-700 border-t-gray-400',
  };
  
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        className
      )}
      role="status"
      aria-label={label}
    >
      {/* Main Spinner */}
      <div
        className={cn(
          // Base spinner styles
          'animate-spin rounded-full',
          // Size-based classes
          sizeClasses[size],
          // Color variant classes
          variantClasses[variant],
          // Optional pulse animation
          pulse && 'animate-pulse',
          // Glassmorphism enhancement
          'backdrop-blur-sm'
        )}
      />
      
      {/* Screen reader text */}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Advanced Loading Spinner with orbital animation
 */
export function OrbitalSpinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };
  
  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
    xl: 'w-2.5 h-2.5',
  };
  
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading..."
    >
      {/* Orbital dots */}
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'absolute rounded-full bg-primary-500',
            dotSizeClasses[size],
            'animate-spin'
          )}
          style={{
            animationDuration: `${1.5 + index * 0.2}s`,
            animationDelay: `${index * 0.2}s`,
            transform: `rotate(${index * 120}deg) translateX(${
              size === 'sm' ? '12px' : 
              size === 'md' ? '18px' : 
              size === 'lg' ? '24px' : '30px'
            })`,
          }}
        />
      ))}
      
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Pulsing Dots Loader
 */
export function DotsLoader({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };
  
  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  };
  
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        gapClasses[size],
        className
      )}
      role="status"
      aria-label="Loading..."
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full bg-primary-500 animate-pulse',
            dotSizeClasses[size]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
      
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Progress Ring Loader
 */
export function ProgressRing({
  size = 'md',
  progress = 0,
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  progress?: number; // 0-100
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  const strokeWidthClasses = {
    sm: '2',
    md: '2',
    lg: '3',
    xl: '4',
  };
  
  const radius = {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 26,
  };
  
  const circumference = 2 * Math.PI * radius[size];
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        className="transform -rotate-90"
        width="100%"
        height="100%"
        viewBox={`0 0 ${radius[size] * 2 + 8} ${radius[size] * 2 + 8}`}
      >
        {/* Background circle */}
        <circle
          cx={radius[size] + 4}
          cy={radius[size] + 4}
          r={radius[size]}
          stroke="currentColor"
          strokeWidth={strokeWidthClasses[size]}
          fill="none"
          className="text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={radius[size] + 4}
          cy={radius[size] + 4}
          r={radius[size]}
          stroke="currentColor"
          strokeWidth={strokeWidthClasses[size]}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary-500 transition-all duration-300 ease-in-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader Component
 */
export function SkeletonLoader({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-700/30 rounded',
        className
      )}
      role="status"
      aria-label="Loading content..."
    >
      {children && (
        <div className="invisible">{children}</div>
      )}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

/**
 * Full Page Loading Component
 */
export function FullPageLoader({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
}: {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-card p-8 text-center max-w-sm w-full mx-4">
        {/* Spinner */}
        <div className="mb-6">
          {showProgress ? (
            <ProgressRing size="xl" progress={progress} className="mx-auto" />
          ) : (
            <OrbitalSpinner size="xl" className="mx-auto" />
          )}
        </div>
        
        {/* Message */}
        <h2 className="text-lg font-semibold text-white mb-2">
          {message}
        </h2>
        
        {/* Progress text */}
        {showProgress && (
          <p className="text-sm text-gray-400">
            {progress}% complete
          </p>
        )}
        
        {/* Additional info */}
        <div className="mt-4 text-xs text-gray-500">
          Please wait while we process your request...
        </div>
      </div>
    </div>
  );
}
