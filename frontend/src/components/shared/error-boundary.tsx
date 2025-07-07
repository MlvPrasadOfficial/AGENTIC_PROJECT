/**
 * File: error-boundary.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: React Error Boundary component with glassmorphic styling and comprehensive error handling
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  /** Child components to protect */
  children: ReactNode;
  /** Fallback component to render when error occurs */
  fallback?: ReactNode;
  /** Custom error handler function */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
  /** Custom className for the error container */
  className?: string;
  /** Custom error title */
  title?: string;
  /** Custom error message */
  message?: string;
}

/**
 * React Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs errors, and displays a fallback UI with glassmorphic styling.
 * 
 * Features:
 * - Comprehensive error catching and logging
 * - Glassmorphic fallback UI design
 * - Development vs production error display
 * - Custom fallback component support
 * - Error retry functionality
 * - Detailed error information display
 * 
 * @example
 * <ErrorBoundary fallback={<CustomErrorFallback />}>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  
  /**
   * Static method to update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }
  
  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error information
    this.setState({
      error,
      errorInfo,
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }
  
  /**
   * Report error to monitoring service
   */
  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // In a real application, send to service like Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    // Example: Send to monitoring service
    // monitoringService.captureException(errorReport);
    console.warn('Error reported to monitoring service:', errorReport);
  }
  
  /**
   * Reset error state to retry rendering
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };
  
  /**
   * Reload the page
   */
  private handleReload = (): void => {
    window.location.reload();
  };
  
  render(): ReactNode {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI with glassmorphic styling
      return (
        <div className={cn(
          'glass-card p-8 text-center max-w-lg mx-auto',
          this.props.className
        )}>
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-8 h-8 text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          {/* Error Title */}
          <h2 className="text-xl font-semibold text-white mb-3">
            {this.props.title || 'Something went wrong'}
          </h2>
          
          {/* Error Message */}
          <p className="text-gray-400 mb-6">
            {this.props.message || 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.'}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={this.handleRetry}
              className="glass-button-primary px-6 py-2 text-sm font-medium"
            >
              Try Again
            </button>
            
            <button 
              onClick={this.handleReload}
              className="glass-button-secondary px-6 py-2 text-sm font-medium"
            >
              Reload Page
            </button>
          </div>
          
          {/* Error Details (Development Only) */}
          {(process.env.NODE_ENV === 'development' || this.props.showDetails) && this.state.error && (
            <details className="mt-8 text-left">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-white mb-3">
                🔍 Technical Details
              </summary>
              
              <div className="space-y-4">
                {/* Error Message */}
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-2">Error Message:</h4>
                  <pre className="text-xs text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
                
                {/* Stack Trace */}
                {this.state.error.stack && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Stack Trace:</h4>
                    <pre className="text-xs text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20 overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                
                {/* Component Stack */}
                {this.state.errorInfo?.componentStack && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Component Stack:</h4>
                    <pre className="text-xs text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500">
              If this error persists, please contact{' '}
              <a 
                href="mailto:support@enterprise-insights.com" 
                className="text-primary-400 hover:text-primary-300 underline"
              >
                support@enterprise-insights.com
              </a>
            </p>
          </div>
        </div>
      );
    }
    
    // If no error, render children normally
    return this.props.children;
  }
}

/**
 * Simplified Error Boundary Hook (for functional components)
 * Note: This is a wrapper around the class-based ErrorBoundary
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Simple Error Display Component for non-boundary errors
 */
export function ErrorDisplay({
  error,
  title = 'Error',
  onRetry,
  className,
}: {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className={cn('glass-card p-6 text-center', className)}>
      {/* Error Icon */}
      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg 
          className="w-6 h-6 text-red-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </div>
      
      {/* Error Content */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{errorMessage}</p>
      
      {/* Retry Button */}
      {onRetry && (
        <button 
          onClick={onRetry}
          className="glass-button-primary px-4 py-2 text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Empty State Component for when no data is available
 */
export function EmptyState({
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  icon,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('glass-card p-8 text-center', className)}>
      {/* Icon */}
      <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon || (
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
        )}
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      
      {/* Action */}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
