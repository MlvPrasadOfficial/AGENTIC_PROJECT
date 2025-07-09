/**
 * File: VizAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Visualization Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function VizAgentIcon({
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
      <title>Visualization Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="vizGradient">
          <stop stopColor="#2196F3" offset="0%"></stop>
          <stop stopColor="#0D47A1" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Chart background */}
        <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#vizGradient)"></rect>
        {/* Chart grid */}
        <line x1="3" y1="12" x2="21" y2="12" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5"></line>
        <line x1="3" y1="7" x2="21" y2="7" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5"></line>
        <line x1="3" y1="17" x2="21" y2="17" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5"></line>
        <line x1="8" y1="3" x2="8" y2="21" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5"></line>
        <line x1="13" y1="3" x2="13" y2="21" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5"></line>
        <line x1="18" y1="3" x2="18" y2="21" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.5"></line>
        {/* Chart line */}
        <path d="M3,17 L6,12 L10,15 L15,9 L21,7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </g>
    </svg>
  );
}

export default VizAgentIcon;
