/**
 * File: DebateAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Debate Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function DebateAgentIcon({
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
      <title>Debate Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="debateGradient">
          <stop stopColor="#F44336" offset="0%"></stop>
          <stop stopColor="#B71C1C" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Left speech bubble */}
        <path d="M4,4 L10,4 C11.1,4 12,4.9 12,6 L12,10 C12,11.1 11.1,12 10,12 L6,12 L4,14 L4,4 Z" fill="url(#debateGradient)"></path>
        {/* Right speech bubble */}
        <path d="M20,10 L14,10 C12.9,10 12,10.9 12,12 L12,16 C12,17.1 12.9,18 14,18 L18,18 L20,20 L20,10 Z" fill="url(#debateGradient)"></path>
        {/* Speech bubble dots */}
        <circle cx="6" cy="8" r="1" fill="#FFFFFF"></circle>
        <circle cx="8" cy="8" r="1" fill="#FFFFFF"></circle>
        <circle cx="10" cy="8" r="1" fill="#FFFFFF"></circle>
        <circle cx="14" cy="14" r="1" fill="#FFFFFF"></circle>
        <circle cx="16" cy="14" r="1" fill="#FFFFFF"></circle>
        <circle cx="18" cy="14" r="1" fill="#FFFFFF"></circle>
      </g>
    </svg>
  );
}

export default DebateAgentIcon;
