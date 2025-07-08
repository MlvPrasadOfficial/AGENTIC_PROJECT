/**
 * File: UploadIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Upload Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function UploadIcon({ 
  className = '',
  ...props
}: Readonly<React.SVGProps<SVGSVGElement>>) {
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
      {...props}
    >
      <path d="M12 16V4M12 4L7 9M12 4l5 5" />
      <rect x="4" y="16" width="16" height="4" rx="2" />
    </svg>
  );
}

export default UploadIcon;
