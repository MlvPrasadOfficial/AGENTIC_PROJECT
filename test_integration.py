#!/usr/bin/env python3
"""
Test Integration - File Upload with Pinecone Test Results Display
This script tests the complete integration between backend and frontend.
"""

import requests
import json

def test_integration():
    """Test file upload and verify Pinecone test results are returned."""
    
    print("🧪 Testing Backend → Frontend Integration")
    print("=" * 50)
    
    # Test file upload
    url = "http://localhost:8000/api/v1/files/upload"
    
    # Create a simple test CSV content
    csv_content = "name,age,city\nJohn,25,NYC\nJane,30,LA\nBob,35,Chicago"
    
    try:
        # Upload file
        print("📤 Uploading test file...")
        files = {'file': ('integration_test.csv', csv_content, 'text/csv')}
        response = requests.post(url, files=files)
        
        print(f"✅ Upload Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n📋 Response Structure:")
            print(f"  - file_id: {data.get('file_id', 'N/A')}")
            print(f"  - filename: {data.get('filename', 'N/A')}")
            print(f"  - status: {data.get('status', 'N/A')}")
            print(f"  - message: {data.get('message', 'N/A')}")
            
            # Check Pinecone tests
            pinecone_tests = data.get('pinecone_tests')
            if pinecone_tests:
                print(f"\n🎯 PINECONE TESTS FOUND! ({len(pinecone_tests)} tests)")
                print("-" * 40)
                
                for test_id, test_data in pinecone_tests.items():
                    status = test_data.get('status', 'UNKNOWN')
                    name = test_data.get('name', 'Unknown Test')
                    details = test_data.get('details', 'No details')
                    
                    emoji = "✅" if status == "PASSED" else "❌"
                    print(f"{emoji} {test_id}: {name}")
                    print(f"   Status: {status}")
                    print(f"   Details: {details}")
                    print()
                
                print("🎉 SUCCESS: Integration test completed!")
                print("📍 Frontend should now display these Pinecone test results")
                print("   in the File Upload Agent card when a file is uploaded.")
                
            else:
                print("\n❌ ERROR: No Pinecone tests found in response")
                print("   Available fields:", list(data.keys()))
                
        else:
            print(f"❌ Upload failed with status {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    test_integration()
