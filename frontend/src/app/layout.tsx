import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

// Configure Inter font with optimal subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

// Enhanced metadata for SEO and social sharing
export const metadata: Metadata = {
  title: 'Enterprise Insights Copilot',
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
};

// Viewport configuration (separate export as required by Next.js 14)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3b82f6',
};

/**
 * Root layout component that provides the foundational structure for all pages
 * Simplified version to fix hydration issues
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={cn('dark h-full', inter.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" href="/css/critical.css" as="style" />
        <link rel="stylesheet" href="/css/critical.css" />
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body 
        className={cn(
          'min-h-screen bg-gray-950 font-sans antialiased',
          'overflow-x-hidden selection:bg-primary-500/30 selection:text-white'
        )}
        suppressHydrationWarning
        data-hydration-safe="true"
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 glass-button-primary px-4 py-2 text-sm font-medium"
        >
          Skip to main content
        </a>
        
        {/* Main application structure */}
        <div className="min-h-screen">
          <main 
            id="main-content"
            className="relative focus:outline-none"
            tabIndex={-1}
          >
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
        </div>
      </body>
    </html>
  );
}
