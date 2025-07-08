/**
 * File: VizIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Modern SVG visualization icon component
 */

import React from 'react';

interface VizIconProps {
  className?: string;
}

export function VizIcon({ className = '' }: Readonly<VizIconProps>) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <path d="M8 14l3-3 2 2 3-3" />
      <circle cx="15" cy="15" r="1" />
      <circle cx="10" cy="11" r="1" />
      <circle cx="13" cy="13" r="1" />
      <circle cx="8" cy="14" r="1" />
    </svg>
  );
}

export default VizIcon;
