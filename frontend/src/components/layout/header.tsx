/**
 * File: frontend/src/components/layout/header.tsx
 * Created: 2024-12-19 09:30:00
 * Description: Main application header with glassmorphic design, navigation, and branding
 * Status: Active component - handles top navigation and brand identity
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

/**
 * Header component with glassmorphic design and navigation
 * Provides main site branding and navigation links
 */
export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10",
        "bg-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5",
        className
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link 
          href="/" 
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AC</span>
          </div>
          <span className="text-xl font-semibold text-white/90">
            Agentic Copilot
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="#upload"
            className="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            Upload
          </Link>
          <Link 
            href="#workflow"
            className="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            Workflow
          </Link>
          <Link 
            href="#chat"
            className="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            Chat
          </Link>
          <Link 
            href="#dashboard"
            className="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            Dashboard
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button 
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <button 
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Help"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
