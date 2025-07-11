#!/usr/bin/env python3
"""
Startup script for Enterprise Insights Copilot Backend
Handles dependency installation and graceful error handling
"""

import sys
import subprocess
import os
from pathlib import Path

def install_dependencies():
    """Install missing dependencies from requirements.txt"""
    requirements_path = Path(__file__).parent / "requirements.txt"
    
    if not requirements_path.exists():
        print("❌ requirements.txt not found")
        return False
    
    try:
        print("📦 Installing dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_path)
        ])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_imports():
    """Check if critical imports are available"""
    missing_modules = []
    
    try:
        import fastapi
        print("✅ FastAPI available")
    except ImportError:
        missing_modules.append("fastapi")
    
    try:
        import uvicorn
        print("✅ Uvicorn available")
    except ImportError:
        missing_modules.append("uvicorn")
    
    try:
        import langchain
        print("✅ LangChain available")
    except ImportError:
        missing_modules.append("langchain")
    
    try:
        import pinecone
        print("✅ Pinecone available")
    except ImportError:
        print("⚠️  Pinecone not available (optional)")
    
    try:
        import sentence_transformers
        print("✅ SentenceTransformers available")
    except ImportError:
        print("⚠️  SentenceTransformers not available (optional)")
    
    try:
        import ollama
        print("✅ Ollama available")
    except ImportError:
        print("⚠️  Ollama not available (optional)")
    
    return missing_modules

def main():
    """Main startup function"""
    print("🚀 Starting Enterprise Insights Copilot Backend...")
    print("=" * 50)
    
    # Check for missing modules
    missing = check_imports()
    
    if missing:
        print(f"\n❌ Missing critical modules: {', '.join(missing)}")
        print("🔧 Attempting to install dependencies...")
        
        if install_dependencies():
            print("✅ Dependencies installed. Please restart the application.")
            sys.exit(0)
        else:
            print("❌ Failed to install dependencies. Please install manually:")
            print(f"   pip install -r requirements.txt")
            sys.exit(1)
    
    print("\n🎯 All critical dependencies available!")
    print("🌟 Starting FastAPI server...")
    
    # Start the FastAPI application
    try:
        import uvicorn
        from app.main import app
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("\n🔍 Try running manually with:")
        print("   python -m uvicorn app.main:app --reload")
        sys.exit(1)

if __name__ == "__main__":
    main()
