/**
 * File: tailwind.config.js
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Tailwind CSS configuration with custom glassmorphism design system, animations, and responsive breakpoints
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Content paths for purging unused CSS
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // Enable dark mode with class strategy
  darkMode: 'class',
  
  theme: {
    extend: {
      // Custom color palette for glassmorphism
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',  // Main brand blue - darker shade
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Accent colors for agents - darker shades
        accent: {
          purple: '#7c3aed',
          emerald: '#059669',
          amber: '#d97706',
          red: '#dc2626',
          cyan: '#0891b2',
          pink: '#db2777',
          indigo: '#4f46e5',
          teal: '#0d9488',
        },
        
        // Glass effect colors
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          'white-hover': 'rgba(255, 255, 255, 0.15)',
          'white-active': 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(31, 41, 55, 0.8)',
          'dark-hover': 'rgba(31, 41, 55, 0.9)',
          border: 'rgba(255, 255, 255, 0.2)',
          'border-hover': 'rgba(255, 255, 255, 0.3)',
        },
        
        // Semantic colors
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#2563eb',
      },
      
      // Custom typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      
      // Enhanced spacing for glassmorphism layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom border radius for glassmorphism
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Backdrop blur utilities
      backdropBlur: {
        '4xl': '72px',
        '5xl': '96px',
      },
      
      // Custom shadows for glassmorphism
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 12px 40px rgba(31, 38, 135, 0.5)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      
      // Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      
      // Custom transitions
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      
      // Responsive breakpoints
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      
      // Custom gradients
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        'agent-gradient': 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      },
    },
  },
  
  // Custom plugins for glassmorphism utilities
  plugins: [
    // Custom plugin for glassmorphism components
    function({ addComponents, theme }) {
      addComponents({
        '.glass-card': {
          '@apply backdrop-blur-[10px] bg-white/10 border border-white/20': {},
          '@apply shadow-glass rounded-2xl transition-all duration-300 ease-in-out': {},
          '&:hover': {
            '@apply bg-white/15 shadow-glass-hover border-white/30 transform -translate-y-0.5': {},
          },
        },
        '.glass-card-elevated': {
          '@apply glass-card shadow-glass-hover': {},
          '&:hover': {
            '@apply shadow-[0_16px_48px_rgba(31,38,135,0.6)] -translate-y-1': {},
          },
        },
        '.glass-button': {
          '@apply glass-card px-6 py-3 cursor-pointer': {},
          '@apply text-white font-medium tracking-wide': {},
          '@apply hover:scale-105 active:scale-95': {},
          '@apply focus:outline-none focus:ring-2 focus:ring-primary-600/50': {},
        },
        '.glass-input': {
          '@apply glass-card px-4 py-3': {},
          '@apply text-white placeholder:text-gray-400': {},
          '@apply focus:outline-none focus:ring-2 focus:ring-primary-600/50': {},
          '@apply focus:border-primary-600/50': {},
        },
        '.glass-modal': {
          '@apply glass-card p-8': {},
          '@apply backdrop-blur-[20px] bg-gray-900/90': {},
          '@apply border-2 border-white/20': {},
        },
        '.glass-navbar': {
          '@apply backdrop-blur-[20px] bg-gray-900/80': {},
          '@apply border-b border-white/10': {},
        },
        '.agent-card': {
          '@apply glass-card p-4 cursor-pointer': {},
          '@apply hover:bg-white/20 transition-all duration-200': {},
          '&.active': {
            '@apply bg-primary-500/20 border-primary-500/50': {},
          },
          '&.processing': {
            '@apply bg-emerald-500/20 border-emerald-500/50': {},
          },
          '&.error': {
            '@apply bg-red-500/20 border-red-500/50': {},
          },
        },
      });
    },
    
    // Custom utilities
    function({ addUtilities }) {
      addUtilities({
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #2563eb, #7c3aed)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-glass': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      });
    },
  ],
};
