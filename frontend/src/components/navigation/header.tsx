/**
 * File: header.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Main navigation header component with glassmorphism design and accessibility
 * Project: Enterprise Insights Copilot - AI-powered analytics platform
 * Features: Navigation links, user menu, theme toggle, and responsive design
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Building2,
    description: 'Data upload and analysis dashboard',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: Building2,
    description: 'Advanced analytics and insights',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: Building2,
    description: 'Generated reports and exports',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Building2,
    description: 'Application settings and preferences',
  },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="glass-navbar border-b border-white/10 shadow-lg backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link 
            href="/"
            className="flex items-center gap-2 hover:scale-105 transition-transform focus-ring rounded-lg p-1"
            aria-label="Enterprise Insights Copilot Home"
          >
            <Building2 className="h-8 w-8 text-primary-400" />
            <span className="hidden sm:block text-xl font-bold text-white ml-2">Enterprise Insights</span>
            <span className="hidden sm:block text-xs text-gray-400 -mt-1 ml-1">Copilot</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    'hover:bg-white/10 hover:text-white focus-ring',
                    isActive 
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
                      : 'text-gray-300 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
