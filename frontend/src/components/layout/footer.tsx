/**
 * File: frontend/src/components/layout/footer.tsx
 * Created: 2024-12-19 09:31:00
 * Description: Application footer with glassmorphic design and links
 * Status: Active component - provides footer information and secondary navigation
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

/**
 * Footer component with glassmorphic design
 * Provides secondary navigation and company information
 */
export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer 
      className={cn(
        "border-t border-white/10 bg-white/5 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-white/5 mt-auto",
        className
      )}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="text-lg font-semibold text-white/90">
                Agentic Copilot
              </span>
            </div>
            <p className="text-white/60 text-sm max-w-md">
              Advanced AI-powered document processing and analysis platform with intelligent agent workflows and RAG-based chat capabilities.
            </p>
          </div>

          {/* Features Links */}
          <div>
            <h3 className="text-white/90 font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#upload" className="text-white/60 hover:text-white transition-colors text-sm">
                  Document Upload
                </Link>
              </li>
              <li>
                <Link href="#workflow" className="text-white/60 hover:text-white transition-colors text-sm">
                  Agent Workflow
                </Link>
              </li>
              <li>
                <Link href="#chat" className="text-white/60 hover:text-white transition-colors text-sm">
                  RAG Chat
                </Link>
              </li>
              <li>
                <Link href="#dashboard" className="text-white/60 hover:text-white transition-colors text-sm">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white/90 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-sm">
            © 2024 Agentic Copilot. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
              Privacy
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
              Terms
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
