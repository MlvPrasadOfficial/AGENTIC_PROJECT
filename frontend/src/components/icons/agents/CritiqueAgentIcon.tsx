/**
 * File: CritiqueAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Critique Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function CritiqueAgentIcon({
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
      <title>Critique Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="critiqueGradient">
          <stop stopColor="#607D8B" offset="0%"></stop>
          <stop stopColor="#37474F" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Scale base */}
        <path d="M12,22 L21,22 C21.55,22 22,21.55 22,21 C22,20.45 21.55,20 21,20 L3,20 C2.45,20 2,20.45 2,21 C2,21.55 2.45,22 3,22 L12,22 Z" fill="url(#critiqueGradient)"></path>
        {/* Scale arm */}
        <line x1="12" y1="4" x2="12" y2="20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
        {/* Scale pans */}
        <circle cx="7" cy="8" r="3" fill="url(#critiqueGradient)" stroke="#FFFFFF" strokeWidth="1.5"></circle>
        <circle cx="17" cy="8" r="3" fill="url(#critiqueGradient)" stroke="#FFFFFF" strokeWidth="1.5"></circle>
        {/* Scale bar */}
        <line x1="6" y1="4" x2="18" y2="4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
      </g>
    </svg>
  );
}

export default CritiqueAgentIcon;
