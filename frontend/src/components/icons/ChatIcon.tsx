/**
 * File: ChatIcon.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Chat Icon component for Enterprise Insights Copilot
 */

import React from 'react';

export function ChatIcon({ 
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
    </svg>
  );
}

export default ChatIcon;
