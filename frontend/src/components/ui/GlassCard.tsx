/**
 * File: frontend/src/components/ui/GlassCard.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Reusable glassmorphism card component for consistent UI styling
 * 
 * This component provides a standardized glass card with:
 * - Consistent glassmorphism effects across the application
 * - Multiple size and style variants
 * - Hover and interaction states
 * - Accessibility features and proper focus management
 * 
 * Features:
 * - Backdrop blur with transparency
 * - Subtle border and shadow effects
 * - Responsive padding and sizing
 * - Support for interactive and static variants
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  /**
   * Card content
   */
  readonly children: React.ReactNode;
  
  /**
   * Additional CSS classes for custom styling
   */
  readonly className?: string;
  
  /**
   * Card size variant
   */
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Card style variant
   */
  readonly variant?: 'default' | 'elevated' | 'flat' | 'interactive';
  
  /**
   * Enable hover effects for interactive cards
   */
  readonly hover?: boolean;
  
  /**
   * Enable blur intensity
   */
  readonly blurIntensity?: 'light' | 'medium' | 'strong';
  
  /**
   * Optional click handler for interactive cards
   */
  readonly onClick?: () => void;
  
  /**
   * Optional aria-label for accessibility
   */
  readonly ariaLabel?: string;
}

/**
 * GlassCard Component
 * 
 * Reusable glassmorphism card component providing consistent styling
 * across the application. Supports multiple variants and interactive states
 * while maintaining accessibility standards.
 * 
 * @param children - Card content
 * @param className - Additional CSS classes
 * @param size - Card size variant (sm, md, lg, xl)
 * @param variant - Card style variant
 * @param hover - Enable hover effects
 * @param blurIntensity - Backdrop blur intensity
 * @param onClick - Click handler for interactive cards
 * @param ariaLabel - Accessibility label
 * @returns {JSX.Element} The glassmorphism card component
 */
export function GlassCard({ 
  children,
  className,
  size = 'md',
  variant = 'default',
  hover = false,
  blurIntensity = 'medium',
  onClick,
  ariaLabel
}: GlassCardProps) {
  // Size-specific padding and dimensions
  const sizeClasses = {
    sm: 'p-4 min-h-[120px]',
    md: 'p-6 min-h-[200px]',
    lg: 'p-8 min-h-[280px]',
    xl: 'p-10 min-h-[360px]'
  };

  // Variant-specific styling
  const variantClasses = {
    default: 'bg-black/20 border-white/10',
    elevated: 'bg-black/30 border-white/20 shadow-2xl',
    flat: 'bg-black/10 border-white/5',
    interactive: 'bg-black/20 border-white/10 cursor-pointer'
  };

  // Blur intensity levels
  const blurClasses = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-xl',
    strong: 'backdrop-blur-2xl'
  };

  // Hover effects
  const hoverClasses = hover || onClick ? [
    'transition-all duration-300 ease-out',
    'hover:bg-black/30 hover:border-white/20',
    'hover:shadow-xl hover:shadow-blue-500/10',
    'hover:scale-[1.02] hover:-translate-y-1'
  ] : [];

  // Interactive states
  const interactiveClasses = onClick ? [
    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
    'active:scale-[0.98] active:translate-y-0'
  ] : [];

  const isInteractive = typeof onClick === 'function';

  if (isInteractive) {
    return (
      <button
        type="button"
        className={cn(
          'glass-card rounded-2xl border',
          blurClasses[blurIntensity],
          sizeClasses[size],
          variantClasses[variant],
          hoverClasses,
          interactiveClasses,
          className
        )}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }
  return (
    <div
      className={cn(
        'glass-card rounded-2xl border',
        blurClasses[blurIntensity],
        sizeClasses[size],
        variantClasses[variant],
        hoverClasses,
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
