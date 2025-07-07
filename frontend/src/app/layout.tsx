/**
 * File: layout.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Root layout component for Enterprise Insights Copilot application
 * Project: AI-powered analytics platform with glassmorphism design and multi-agent workflow system
 * Features: Global providers, responsive navigation, accessibility, and theme management
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { ToastContainer } from '@/components/ui/toast';
import { Header } from '@/components/navigation/header';

// Configure Inter font with optimal subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

// Enhanced metadata for SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Enterprise Insights Copilot',
    template: '%s | Enterprise Insights Copilot',
  },
  description: 'Advanced AI-powered analytics platform with multi-agent workflow for comprehensive data insights, visualization, and reporting.',
  keywords: [
    'AI analytics',
    'data insights',
    'business intelligence',
    'multi-agent system',
    'data visualization',
    'enterprise analytics',
    'automated reporting',
  ],
  authors: [{ name: 'GitHub Copilot' }],
  creator: 'GitHub Copilot',
  publisher: 'Enterprise Insights',
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://enterprise-insights-copilot.com',
    title: 'Enterprise Insights Copilot',
    description: 'Advanced AI-powered analytics platform with multi-agent workflow',
    siteName: 'Enterprise Insights Copilot',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Enterprise Insights Copilot - AI Analytics Platform',
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Insights Copilot',
    description: 'Advanced AI-powered analytics platform with multi-agent workflow',
    images: ['/images/og-image.png'],
    creator: '@enterprise_insights',
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification and analytics
  verification: {
    google: 'your-google-verification-code',
  },
  
  // App-specific metadata
  applicationName: 'Enterprise Insights Copilot',
  category: 'Business Intelligence',
  classification: 'Analytics Platform',
  
  // Icon configuration
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // Manifest for PWA
  manifest: '/manifest.json',
};

// Viewport configuration (separate export as required by Next.js 14)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' },
  ],
};

/**
 * Root layout component that provides the foundational structure for all pages
 * Includes global providers, navigation, and accessibility features
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={cn(
        'dark h-full',
        inter.variable
      )}
      suppressHydrationWarning
    >
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Critical CSS preload */}
        <link
          rel="preload"
          href="/css/critical.css"
          as="style"
        />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.enterprise-insights.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance hints */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
      </head>
      
      <body 
        className={cn(
          'min-h-screen bg-gray-950 font-sans antialiased',
          'overflow-x-hidden selection:bg-primary-500/30 selection:text-white',
          // Custom scrollbar for glass effect
          'scrollbar-glass'
        )}
      >
        {/* Global providers for state management, theme, and utilities */}
        <Providers>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className={cn(
              'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50',
              'glass-button-primary px-4 py-2 text-sm font-medium',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50'
            )}
          >
            Skip to main content
          </a>
          
          {/* Main application structure */}
          <div className="flex min-h-screen flex-col">
            {/* Header Navigation */}
            <Header />
            
            {/* Main content area */}
            <main 
              id="main-content"
              className={cn(
                'flex-1 relative',
                // Add padding to prevent content overlap with fixed header
                'pt-16',
                // Ensure proper focus management
                'focus:outline-none'
              )}
              tabIndex={-1}
            >
              {/* Page content with glass backdrop */}
              <div className="relative min-h-full">
                {/* Background pattern overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-purple-500/5 pointer-events-none"
                  aria-hidden="true"
                />
                
                {/* Content wrapper */}
                <div className="relative z-10">
                  {children}
                </div>
              </div>
            </main>
            
            {/* Global toast notifications */}
            <ToastContainer />
            
            {/* Footer (minimal for focus on main content) */}
            <footer className="glass-navbar border-t border-white/10 py-4">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <p>&copy; 2025 Enterprise Insights Copilot. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <a 
                      href="/privacy" 
                      className="hover:text-white transition-colors focus-ring"
                    >
                      Privacy
                    </a>
                    <a 
                      href="/terms" 
                      className="hover:text-white transition-colors focus-ring"
                    >
                      Terms
                    </a>
                    <a 
                      href="/support" 
                      className="hover:text-white transition-colors focus-ring"
                    >
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          
          {/* Development tools (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className="glass-card p-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Dev Mode</span>
                </div>
              </div>
            </div>
          )}
        </Providers>
        
        {/* Loading indicator for page transitions */}
        <div 
          id="loading-indicator"
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500 transform scale-x-0 origin-left transition-transform duration-300 z-50"
          aria-hidden="true"
        />
        
        {/* Global keyboard shortcuts helper (hidden by default) */}
        <dialog 
          id="keyboard-shortcuts"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden"
          aria-label="Keyboard shortcuts"
          aria-hidden="true"
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="glass-modal max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl/Cmd + K</kbd>
                  <span>Open command palette</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl/Cmd + U</kbd>
                  <span>Upload file</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl/Cmd + Enter</kbd>
                  <span>Send message</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd>
                  <span>Close modal/panel</span>
                </div>
              </div>
              <div className="glass-button-primary w-full mt-4 text-center py-2">
                Press Esc to close
              </div>
            </div>
          </div>
        </dialog>
      </body>
    </html>
  );
}
