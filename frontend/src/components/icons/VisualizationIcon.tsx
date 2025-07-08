/**
 * File: VisualizationIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Modern SVG visualization icon component
 */

import React from 'react';

interface VisualizationIconProps {
  className?: string;
}

export function VisualizationIcon({ className = '' }: Readonly<VisualizationIconProps>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}
