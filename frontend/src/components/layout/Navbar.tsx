/**
 * File: Navbar.tsx
 * Author: GitHub Copilot
 * Date: 2025-01-08
 * Purpose: Simplified navigation bar with centered header typography
 * Version: 2.0.0 - Reset to minimal header-only design
 */

'use client';

import React from 'react';

/**
 * Simplified Navbar component with only centered header
 * 
 * DESIGN APPROACH:
 * - Clean, minimal design with centered typography
 * - Removed all navigation links and menu items
 * - Focus on the main application title
 * - Professional gradient text effect
 * - Responsive design maintained
 * 
 * TYPOGRAPHY FEATURES:
 * - Large, prominent text size (text-3xl)
 * - Semi-bold weight for readability
 * - Gradient color from blue to purple
 * - Background clip for smooth gradient effect
 * - Transparent text with gradient background
 * 
 * LAYOUT STRUCTURE:
 * - Full width navigation bar
 * - Centered content alignment
 * - Proper padding and spacing
 * - Sticky positioning for consistent visibility
 * - Professional backdrop blur effect
 * 
 * @component Navbar
 * @returns {JSX.Element} Simplified navbar with centered header
 */
export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900/98 border-b border-gray-700/50 py-6 px-6 sticky top-0 z-[100] backdrop-blur-md shadow-lg w-full">
      <div className="w-full max-w-none flex justify-center items-center">
        {/* Centered Application Title with Professional Typography - Bigger and More Centered */}
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
          Enterprise Insights Copilot
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
