/**
 * File: PlanningAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Planning Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function PlanningAgentIcon({
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
      <title>Planning Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="planningGradient">
          <stop stopColor="#FFA726" offset="0%"></stop>
          <stop stopColor="#EF6C00" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Target icon */}
        <circle cx="12" cy="12" r="9" fill="url(#planningGradient)"></circle>
        <circle cx="12" cy="12" r="7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
        <circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
        <circle cx="12" cy="12" r="1" fill="#FFFFFF"></circle>
        {/* Target lines */}
        <line x1="12" y1="2" x2="12" y2="4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
        <line x1="12" y1="20" x2="12" y2="22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
        <line x1="2" y1="12" x2="4" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
        <line x1="20" y1="12" x2="22" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
      </g>
    </svg>
  );
}

export default PlanningAgentIcon;
