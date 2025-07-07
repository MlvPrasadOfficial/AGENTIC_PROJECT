/** @type {import('next').NextConfig} */
/**
 * File: next.config.js
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Next.js 15 configuration for Enterprise Insights Copilot frontend application
 * Project: AI-powered analytics platform with glassmorphism design and multi-agent workflow
 * Features: Performance optimizations, security headers, static export, and webpack customizations
 */

const nextConfig = {
  // Enable experimental features for better performance (Next.js 15)
  experimental: {
    // Optimize bundle size
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    // Enable React 19 features in Next.js 15
    reactCompiler: false, // Set to true when React 19 compiler is stable
  },
  
  // Server external packages (moved from experimental in Next.js 15)
  serverExternalPackages: ['d3', 'sharp'],
  
  // Images optimization
  images: {
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Optimize for performance
    domains: ['localhost'],
    // Minimize layout shift
    minimumCacheTTL: 60,
  },
  
  // Compiler options for better performance
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable static export for better performance
  output: 'standalone',
  
  // Enable source maps in development
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  
  // Webpack configuration for custom optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for glassmorphism styles
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]components[\\/]ui[\\/]/,
            enforce: true,
          },
          features: {
            name: 'features',
            chunks: 'all',
            test: /[\\/]features[\\/]/,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Enable compression
  compress: true,
  
  // Enable strict mode for better React performance
  reactStrictMode: true,
};

module.exports = nextConfig;
