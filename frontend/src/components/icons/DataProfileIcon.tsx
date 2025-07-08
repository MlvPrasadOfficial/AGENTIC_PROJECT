/**
 * File: DataProfileIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Modern SVG data profile icon component
 */

import React from 'react';

interface DataProfileIconProps {
  className?: string;
}

export function DataProfileIcon({ className = '' }: Readonly<DataProfileIconProps>) {
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
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="12" y2="14" />
      <circle cx="17" cy="15" r="3" />
      <path d="M17 12v-1a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

export default DataProfileIcon;
