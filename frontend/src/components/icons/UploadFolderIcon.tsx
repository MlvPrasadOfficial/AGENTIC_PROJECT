/**
 * File: UploadFolderIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: Upload Folder Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function UploadFolderIcon({
  className = '',
  size = 24,
  ...props
}: Readonly<React.SVGProps<SVGSVGElement> & { size?: number }>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size}
      viewBox="0 0 64 64" 
      className={className}
      {...props}
    >
      <title>Upload Folder Icon</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="folderGradient">
          <stop stopColor="#3a7bd5" offset="0%"></stop>
          <stop stopColor="#2456a8" offset="100%"></stop>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"></feGaussianBlur>
          <feOffset dx="0" dy="2" result="offsetblur"></feOffset>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"></feFuncA>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Folder Base */}
        <path d="M56,18H32l-6,-6H8C5.8,12 4,13.8 4,16v32c0,2.2 1.8,4 4,4h48c2.2,0 4,-1.8 4,-4V22C60,19.8 58.2,18 56,18z" fill="url(#folderGradient)" filter="url(#shadow)"></path>
        
        {/* Folder Front */}
        <path d="M60,24H4v24c0,2.2 1.8,4 4,4h48c2.2,0 4,-1.8 4,-4V24z" fill="#3a7bd5" opacity="0.85" filter="url(#shadow)"></path>
        
        {/* Upload Arrow */}
        <g transform="translate(20, 28)" fill="#FFFFFF" fillRule="nonzero">
          {/* Arrow stem */}
          <rect x="10" y="8" width="4" height="16" rx="1"></rect>
          {/* Arrow head */}
          <path d="M12,4 L22,14 C22.5523,14.5523 22.5523,15.4477 22,16 C21.4477,16.5523 20.5523,16.5523 20,16 L12,8 L4,16 C3.44772,16.5523 2.55228,16.5523 2,16 C1.44772,15.4477 1.44772,14.5523 2,14 L12,4 Z"></path>
        </g>
        
        {/* Glossy effect */}
        <path d="M4,24 L4,48 C4,50.2 5.8,52 8,52 L56,52 C58.2,52 60,50.2 60,48 L60,24 L4,24 Z" fill="white" opacity="0.05"></path>
      </g>
    </svg>
  );
}

export default UploadFolderIcon;
