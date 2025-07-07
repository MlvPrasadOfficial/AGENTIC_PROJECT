/**
 * File: header.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Main navigation header component with glassmorphism design and accessibility
 * Project: Enterprise Insights Copilot - AI-powered analytics platform
 * Features: Navigation links, user menu, theme toggle, and responsive design
 */

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Home, 
  BarChart3, 
  FileText, 
  Settings, 
  User,
  Sun,
  Menu,
  X,
  type LucideIcon
} from 'lucide-react';

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
    icon: Home,
    description: 'Data upload and analysis dashboard'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Advanced analytics and insights'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Generated reports and exports'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application settings and preferences'
  },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-navbar border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-2 hover:scale-105 transition-transform focus-ring rounded-lg p-1"
              aria-label="Enterprise Insights Copilot Home"
            >
              <div className="relative">
                <Building2 className="h-8 w-8 text-primary-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">Enterprise Insights</h1>
                <p className="text-xs text-gray-400 -mt-1">Copilot</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors focus-ring"
              aria-label="Toggle theme"
              title="Toggle light/dark theme"
            >
              <Sun className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors focus-ring"
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm text-gray-300">Admin</span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-48 glass-modal border border-white/10 shadow-xl">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-sm font-medium text-white">Admin User</p>
                      <p className="text-xs text-gray-400">admin@company.com</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus-ring"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-400" />
              ) : (
                <Menu className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                      'hover:bg-white/10 hover:text-white focus-ring',
                      isActive 
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
                        : 'text-gray-300 hover:text-white'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <span>{item.name}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
