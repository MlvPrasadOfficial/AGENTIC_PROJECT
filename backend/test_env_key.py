#!/usr/bin/env python3
"""
Test script to verify Pinecone API key is loaded from .env file

This script will print the Pinecone API key from the environment to verify
it's being loaded correctly from the .env file.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings

def test_env_key():
    """Test that the Pinecone API key is loaded from .env file"""
    print("🔍 Testing Pinecone API Key from Environment")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        print(f"✅ .env file found at: {env_file}")
    else:
        print(f"❌ .env file not found at: {env_file}")
        return False
    
    # Check API key from settings
    if settings.PINECONE_API_KEY:
        # Mask the API key for security (show first 8 and last 4 characters)
        masked_key = settings.PINECONE_API_KEY[:8] + "..." + settings.PINECONE_API_KEY[-4:]
        print(f"✅ PINECONE_API_KEY loaded: {masked_key}")
        print(f"✅ API Key length: {len(settings.PINECONE_API_KEY)} characters")
    else:
        print("❌ PINECONE_API_KEY not found in environment")
        return False
    
    # Check other Pinecone settings
    print(f"✅ PINECONE_INDEX_NAME: {settings.PINECONE_INDEX_NAME}")
    print(f"✅ PINECONE_HOST: {settings.PINECONE_HOST}")
    print(f"✅ PINECONE_DIMENSION: {settings.PINECONE_DIMENSION}")
    print(f"✅ PINECONE_METRIC: {settings.PINECONE_METRIC}")
    print(f"✅ PINECONE_CLOUD: {settings.PINECONE_CLOUD}")
    print(f"✅ PINECONE_REGION: {settings.PINECONE_REGION}")
    
    # Check environment variable directly
    env_key = os.getenv("PINECONE_API_KEY")
    if env_key:
        masked_env_key = env_key[:8] + "..." + env_key[-4:]
        print(f"✅ Direct from os.getenv(): {masked_env_key}")
        print(f"✅ Direct key length: {len(env_key)} characters")
    else:
        print("❌ PINECONE_API_KEY not found in os.environ")
        return False
    
    print("\n🎉 SUCCESS: Pinecone API key is properly loaded from .env file!")
    return True

if __name__ == "__main__":
    success = test_env_key()
    sys.exit(0 if success else 1)
