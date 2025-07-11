# Test Runner Script
# File: run_tests.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Simple test runner for Enterprise Insights Copilot

import sys
import subprocess
from pathlib import Path

def run_unit_tests():
    """Run unit tests"""
    print("🧪 Running unit tests...\n")
    
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/unit/",
        "-v",
        "--tb=short",
        "--no-cov"  # Disable coverage for now to avoid complexity
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def main():
    """Main test runner"""
    print("🚀 Enterprise Insights Copilot Test Runner\n")
    
    # Check if we're in the right directory
    if not Path("tests").exists():
        print("❌ Tests directory not found. Make sure you're in the backend directory.")
        return False
    
    # Run unit tests
    if run_unit_tests():
        print("\n✅ All tests passed!")
        return True
    else:
        print("\n❌ Some tests failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
