/**
 * File: FileUploadAgentIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: File Upload Agent Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function FileUploadAgentIcon({
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
      <title>File Upload Agent Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="uploadGradient">
          <stop stopColor="#4a8eff" offset="0%"></stop>
          <stop stopColor="#2456a8" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Document */}
        <path d="M14,2 L20,8 L20,20 C20,21.1 19.1,22 18,22 L6,22 C4.9,22 4,21.1 4,20 L4,4 C4,2.9 4.9,2 6,2 L14,2 Z" fill="url(#uploadGradient)"></path>
        {/* Document fold */}
        <path d="M14,2 L14,8 L20,8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        {/* Upload arrow */}
        <path d="M12,10 L12,18 M9,13 L12,10 L15,13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </g>
    </svg>
  );
}

export default FileUploadAgentIcon;
