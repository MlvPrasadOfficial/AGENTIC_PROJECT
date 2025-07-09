# Cross-platform starter script for Enterprise Insights Copilot
# Works in Windows, macOS, and Linux using Python's multiprocessing
# Author: GitHub Copilot
# Date: 2025-07-09

import os
import sys
import subprocess
import platform
import time
import signal
import webbrowser
from multiprocessing import Process

# Define colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"{Colors.HEADER}{Colors.BOLD}*** {text} ***{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKBLUE}→ {text}{Colors.ENDC}")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}! {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

# Function to start the backend server
def start_backend():
    print_info("Starting backend server...")
    os.chdir("backend")
    
    # Check if required packages are installed
    try:
        import uvicorn
        import fastapi
    except ImportError:
        print_warning("Installing required Python packages for backend...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    try:
        import uvicorn
        # Start the backend server
        uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    except Exception as e:
        print_error(f"Failed to start backend server: {str(e)}")
        return

# Function to start the frontend server
def start_frontend():
    print_info("Starting frontend server...")
    os.chdir("frontend")
    
    # Check if node_modules exists, if not run npm install
    if not os.path.exists("node_modules"):
        print_warning("Installing frontend dependencies (this might take a minute)...")
        if platform.system() == "Windows":
            subprocess.run(["npm.cmd", "install"], check=True)
        else:
            subprocess.run(["npm", "install"], check=True)
    
    # Start the frontend development server
    if platform.system() == "Windows":
        subprocess.run(["npm.cmd", "run", "dev"])
    else:
        subprocess.run(["npm", "run", "dev"])

# Main function
def main():
    print_header("Enterprise Insights Copilot Starter")
    
    # Get the current working directory
    cwd = os.getcwd()
    
    # Start backend and frontend in separate processes
    backend_process = Process(target=start_backend)
    frontend_process = Process(target=start_frontend)
    
    try:
        # Start processes
        backend_process.start()
        print_success("Backend server started at http://localhost:8000")
        
        # Wait for backend to initialize
        time.sleep(2)
        
        frontend_process.start()
        print_success("Frontend server started at http://localhost:3000")
        
        # Open browser
        time.sleep(2)
        print_info("Opening application in browser...")
        webbrowser.open("http://localhost:3000")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print_info("\nShutting down servers...")
    finally:
        # Clean up processes
        if backend_process.is_alive():
            backend_process.terminate()
        if frontend_process.is_alive():
            frontend_process.terminate()
        
        print_success("All servers stopped. Goodbye!")

if __name__ == "__main__":
    main()
