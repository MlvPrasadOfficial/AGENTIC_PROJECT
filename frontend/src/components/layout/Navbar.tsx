/**
 * File: Navbar.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-10
 * Purpose: Professional navigation bar component for Enterprise Insights Copilot
 */

'use client';

import React from 'react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900/98 border-b border-gray-700/50 py-4 px-6 sticky top-0 z-[100] backdrop-blur-md shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Logo SVG Icon */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-400"
          >
            <path 
              d="M4 8h24v2H4V8zm0 6h24v2H4v-2zm0 6h16v2H4v-2z" 
              fill="currentColor"
            />
            <circle cx="24" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M26 18l-4 4-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Title with great typography */}
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Enterprise Insights Copilot
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-200 hover:text-blue-400 transition-colors duration-200 font-medium">
            Dashboard
          </Link>
          <Link href="/documentation" className="text-gray-200 hover:text-blue-400 transition-colors duration-200 font-medium">
            Documentation
          </Link>
          <Link href="/settings" className="text-gray-200 hover:text-blue-400 transition-colors duration-200 font-medium">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
