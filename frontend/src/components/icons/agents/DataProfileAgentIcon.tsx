/**
 * File: DataProfileAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Data Profile Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function DataProfileAgentIcon({
  className = '',
  size = 24,
  ...props
}: Readonly<React.SVGProps<SVGSVGElement> & { size?: number }>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size}
      viewBox="0 0 24 24" 
      className={className}
      {...props}
    >
      <title>Data Profile Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="dataProfileGradient">
          <stop stopColor="#4CAF50" offset="0%"></stop>
          <stop stopColor="#2E7D32" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Database icon */}
        <path d="M12,2 C16.42,2 20,3.79 20,6 L20,18 C20,20.21 16.42,22 12,22 C7.58,22 4,20.21 4,18 L4,6 C4,3.79 7.58,2 12,2 Z" fill="url(#dataProfileGradient)"></path>
        {/* Database sections */}
        <path d="M20,10 C20,12.21 16.42,14 12,14 C7.58,14 4,12.21 4,10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M20,6 C20,8.21 16.42,10 12,10 C7.58,10 4,8.21 4,6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M20,14 C20,16.21 16.42,18 12,18 C7.58,18 4,16.21 4,14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </g>
    </svg>
  );
}

export default DataProfileAgentIcon;
