#!/usr/bin/env node

/**
 * Frontend Startup Script with Professional Timestamp Design
 * 
 * @fileoverview Custom startup script for the Enterprise Insights Copilot frontend
 * @author GitHub Copilot
 * @version 1.0.0
 * @since 2025-07-17
 * 
 * @description
 * This script provides a professional startup experience for the Next.js frontend
 * application with a 3-line timestamp design terminal log and proper process management.
 * 
 * Features:
 * - Professional 3-line timestamp design for startup logging
 * - Proper process management with signal handling
 * - Clean shutdown procedures
 * - Error handling and exit code management
 * 
 * Usage:
 *   node start-frontend.js
 *   npm run dev-custom
 */

// Node.js core modules for process management
const { spawn } = require('child_process');
const path = require('path');

/**
 * Display professional 3-line timestamp design terminal log
 * Creates a visually appealing startup message with current timestamp
 */
function displayStartupLog() {
    // Create visual separator line (60 characters)
    console.log("=".repeat(60));
    // Display frontend startup message with formatted timestamp
    console.log(`🎨 FRONTEND SERVER STARTING | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`);
    // Close visual separator for clean presentation
    console.log("=".repeat(60));
}

/**
 * Initialize and start the Next.js development server
 * Spawns npm run dev command with proper configuration
 */
function startNextJSServer() {
    // Display professional startup logging
    displayStartupLog();
    
    // Start the Next.js development server with npm run dev
    const nextDev = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname),  // Set working directory to frontend folder
        stdio: 'inherit',           // Inherit parent process stdio streams
        shell: true                 // Use shell for cross-platform compatibility
    });
    
    return nextDev;
}

/**
 * Handle graceful shutdown on SIGINT (Ctrl+C)
 * Ensures proper cleanup of child processes
 */
function handleSIGINT(childProcess) {
    process.on('SIGINT', () => {
        console.log('\n🛑 Frontend server shutting down...');
        childProcess.kill('SIGINT');
        process.exit(0);
    });
}

/**
 * Handle graceful shutdown on SIGTERM (system termination)
 * Ensures proper cleanup of child processes
 */
function handleSIGTERM(childProcess) {
    process.on('SIGTERM', () => {
        console.log('\n🛑 Frontend server shutting down...');
        childProcess.kill('SIGTERM');
        process.exit(0);
    });
}

/**
 * Handle child process termination
 * Logs exit status and propagates exit code
 */
function handleChildProcessExit(childProcess) {
    childProcess.on('close', (code) => {
        console.log(`\n📊 Frontend server exited with code ${code}`);
        process.exit(code);
    });
}

// Main execution flow
// Start the Next.js server and set up process management
const nextDev = startNextJSServer();

// Set up signal handlers for graceful shutdown
handleSIGINT(nextDev);
handleSIGTERM(nextDev);

// Handle child process termination
handleChildProcessExit(nextDev);
