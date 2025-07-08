/**
 * File: ChevronRightIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Chevron Right Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export const ChevronRightIcon = ({ 
  className = '',
  ...props
}: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`lucide lucide-chevron-right ${className}`}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
};

export default ChevronRightIcon;
