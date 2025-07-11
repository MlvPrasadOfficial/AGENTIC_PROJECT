# Local Environment Setup Script
# File: setup_local.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Setup script for local development environment

import os
import sys
import subprocess
import asyncio
import httpx
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def check_ollama_installation():
    """Check if Ollama is installed and running"""
    try:
        result = subprocess.run(['ollama', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ Ollama detected: {result.stdout.strip()}")
            return True
        else:
            print("❌ Ollama not found in PATH")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("❌ Ollama not installed or not in PATH")
        return False

async def check_ollama_service():
    """Check if Ollama service is running"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags", timeout=5.0)
            if response.status_code == 200:
                models = response.json().get("models", [])
                print(f"✅ Ollama service running with {len(models)} models")
                return True, models
            else:
                print("❌ Ollama service not responding correctly")
                return False, []
    except Exception as e:
        print(f"❌ Ollama service not accessible: {e}")
        return False, []

async def check_required_model():
    """Check if required model is available"""
    required_model = "llama3.1:8b"
    service_running, models = await check_ollama_service()
    
    if not service_running:
        return False
    
    available_models = [model["name"] for model in models]
    
    if any(required_model in model for model in available_models):
        print(f"✅ Required model {required_model} is available")
        return True
    else:
        print(f"❌ Required model {required_model} not found")
        print(f"Available models: {available_models}")
        return False

def pull_required_model():
    """Pull the required model if not available"""
    required_model = "llama3.1:8b"
    print(f"📥 Pulling model {required_model}...")
    
    try:
        result = subprocess.run(
            ['ollama', 'pull', required_model],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode == 0:
            print(f"✅ Model {required_model} pulled successfully")
            return True
        else:
            print(f"❌ Failed to pull model {required_model}")
            print(f"Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"❌ Timeout pulling model {required_model}")
        return False
    except Exception as e:
        print(f"❌ Error pulling model: {e}")
        return False

def create_env_file():
    """Create .env file from template if it doesn't exist"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists() and env_example.exists():
        print("📝 Creating .env file from template...")
        env_file.write_text(env_example.read_text())
        print("✅ .env file created. Please review and update the configuration.")
        return True
    elif env_file.exists():
        print("✅ .env file already exists")
        return True
    else:
        print("❌ .env.example template not found")
        return False

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                      check=True, capture_output=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_upload_directory():
    """Create upload directory if it doesn't exist"""
    upload_dir = Path("uploads")
    if not upload_dir.exists():
        upload_dir.mkdir(parents=True, exist_ok=True)
        print("✅ Upload directory created")
    else:
        print("✅ Upload directory exists")

async def main():
    """Main setup function"""
    print("🚀 Setting up Enterprise Insights Copilot local environment\n")
    
    # Check Python version
    if not check_python_version():
        print("\n❌ Setup failed: Python version incompatible")
        return False
    
    # Check Ollama installation
    if not check_ollama_installation():
        print("\n❌ Setup failed: Ollama not installed")
        print("Please install Ollama from https://ollama.ai/")
        return False
    
    # Check if Ollama service is running
    service_running, models = await check_ollama_service()
    if not service_running:
        print("\n❌ Setup failed: Ollama service not running")
        print("Please start Ollama with: ollama serve")
        return False
    
    # Check required model
    if not await check_required_model():
        print("\n🔄 Attempting to pull required model...")
        if not pull_required_model():
            print("\n❌ Setup failed: Could not pull required model")
            return False
    
    # Create environment file
    if not create_env_file():
        print("\n❌ Setup failed: Could not create .env file")
        return False
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Setup failed: Could not install dependencies")
        return False
    
    # Create upload directory
    create_upload_directory()
    
    print("\n✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Review and update the .env file with your configuration")
    print("2. Run the application with: python main.py")
    print("3. Access the API documentation at: http://localhost:8000/api/docs")
    print("4. For Pinecone integration, add your API key to the .env file")
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error during setup: {e}")
        sys.exit(1)
