/**
 * File: frontend/src/components/ui/card.tsx
 * Created: 2024-12-19 09:33:00
 * Description: Glassmorphic card component for content containers
 * Status: Active component - provides styled card containers with backdrop blur
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const cardVariants = {
  default: 'bg-white/10 border-white/20',
  elevated: 'bg-white/15 border-white/30 shadow-2xl',
  outline: 'bg-white/5 border-white/30'
};

/**
 * Card component with glassmorphic styling
 * Provides a container with backdrop blur and border effects
 */
export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border backdrop-blur-xl p-6',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        cardVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card header component for titles and descriptions
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card content component for main content area
 */
export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * Card footer component for actions and additional content
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center pt-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
