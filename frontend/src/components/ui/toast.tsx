/**
 * File: toast.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Toast notification component for user feedback and alerts
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/providers';

// Toast notification icons
const toastIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

// Toast notification styles
const toastStyles = {
  success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100',
  error: 'bg-red-500/20 border-red-500/30 text-red-100',
  warning: 'bg-amber-500/20 border-amber-500/30 text-amber-100',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-100',
};

/**
 * Individual toast notification component
 * 
 * Displays a single toast notification with:
 * - Icon based on type
 * - Title and optional description
 * - Close button
 * - Auto-dismiss functionality
 * - Smooth animations
 * 
 * @param id - Unique identifier for the toast
 * @param title - Main message title
 * @param description - Optional detailed description
 * @param type - Type of notification (success, error, warning, info)
 * @param onClose - Callback when toast is closed
 */
interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}

export function Toast({ id, title, description, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  // Show toast with slide-in animation
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle toast removal with slide-out animation
  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div
      className={cn(
        'glass-card p-4 mb-3 min-w-[300px] max-w-md',
        'transform transition-all duration-300 ease-in-out',
        toastStyles[type],
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        isRemoving && 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Toast icon */}
        <div className="text-lg flex-shrink-0">
          {toastIcons[type]}
        </div>

        {/* Toast content */}
        <div className="flex-1">
          <h4 className="font-medium text-white mb-1">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-gray-300">
              {description}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Toast container that manages all active toasts
 * 
 * This component:
 * - Positions toasts in the top-right corner
 * - Manages z-index for proper layering
 * - Handles toast animations and removal
 * - Provides keyboard navigation support
 * - Implements proper ARIA attributes
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  // Don't render container if no toasts
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 pointer-events-none"
      aria-label="Notifications"
    >
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for showing toast notifications
 * 
 * Provides convenient methods for showing different types of toasts:
 * - toast.success(title, description)
 * - toast.error(title, description)
 * - toast.warning(title, description)
 * - toast.info(title, description)
 * 
 * @returns Object with toast methods
 */
export function useToastNotification() {
  const { addToast } = useToast();

  const toast = {
    success: (title: string, description?: string) => {
      addToast({ title, description, type: 'success' });
    },
    error: (title: string, description?: string) => {
      addToast({ title, description, type: 'error' });
    },
    warning: (title: string, description?: string) => {
      addToast({ title, description, type: 'warning' });
    },
    info: (title: string, description?: string) => {
      addToast({ title, description, type: 'info' });
    },
  };

  return toast;
}

/**
 * Simple toast notification component for quick messages
 * 
 * Usage:
 * ```tsx
 * <SimpleToast
 *   message="File uploaded successfully"
 *   type="success"
 *   onClose={() => setShowToast(false)}
 * />
 * ```
 */
interface SimpleToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export function SimpleToast({ message, type, onClose, duration = 3000 }: SimpleToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={cn(
        'glass-card p-3 rounded-lg shadow-lg',
        'flex items-center gap-2',
        'animate-in slide-in-from-top-2',
        toastStyles[type]
      )}
      role="alert"
    >
      <span className="text-sm">
        {toastIcons[type]}
      </span>
      <span className="text-sm font-medium text-white">
        {message}
      </span>
      <button
        onClick={onClose}
        className="ml-auto text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast progress bar component for long-running operations
 * 
 * Shows a progress bar at the bottom of the toast
 * to indicate operation progress
 */
interface ToastProgressProps {
  progress: number;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function ToastProgress({ progress, type }: ToastProgressProps) {
  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            progressColors[type]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

export default ToastContainer;
