/**
 * File: ReportAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Report Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function ReportAgentIcon({
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
      <title>Report Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="reportGradient">
          <stop stopColor="#00BCD4" offset="0%"></stop>
          <stop stopColor="#006064" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Document base */}
        <path d="M14,2 L20,8 L20,20 C20,21.1 19.1,22 18,22 L6,22 C4.9,22 4,21.1 4,20 L4,4 C4,2.9 4.9,2 6,2 L14,2 Z" fill="url(#reportGradient)"></path>
        {/* Document fold */}
        <path d="M14,2 L14,8 L20,8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        {/* Document lines */}
        <line x1="8" y1="14" x2="16" y2="14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
        <line x1="8" y1="18" x2="16" y2="18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
        <line x1="8" y1="10" x2="12" y2="10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
      </g>
    </svg>
  );
}

export default ReportAgentIcon;
