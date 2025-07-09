/**
 * File: InsightAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Insight Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function InsightAgentIcon({
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
      <title>Insight Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="insightGradient">
          <stop stopColor="#9C27B0" offset="0%"></stop>
          <stop stopColor="#6A1B9A" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Lightbulb */}
        <path d="M12,2 C15.3,2 18,4.7 18,8 C18,11.3 15.3,14 12,14 C8.7,14 6,11.3 6,8 C6,4.7 8.7,2 12,2 Z" fill="url(#insightGradient)"></path>
        <path d="M10,14 L14,14 L14,18 C14,19.1 13.1,20 12,20 L12,20 C10.9,20 10,19.1 10,18 L10,14 Z" fill="url(#insightGradient)"></path>
        {/* Lightbulb glow lines */}
        <line x1="12" y1="22" x2="12" y2="20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></line>
        <path d="M7.05,11.05 L4.929,13.172" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></path>
        <path d="M16.95,11.05 L19.071,13.172" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"></path>
        {/* Filament */}
        <path d="M11,8 L13,8 M10,10 L14,10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </g>
    </svg>
  );
}

export default InsightAgentIcon;
