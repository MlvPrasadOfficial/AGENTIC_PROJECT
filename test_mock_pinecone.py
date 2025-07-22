#!/usr/bin/env python3

import requests
import json
from pathlib import Path

def test_file_upload_with_mock_pinecone():
    """Test file upload with our mock Pinecone tests to verify data flow."""
    
    # API endpoint
    url = "http://localhost:8000/api/v1/files/upload"
    
    # Use our test file
    test_file_path = "test_flow_verification.csv"
    
    try:
        print(f"🧪 Testing file upload with mock Pinecone tests...")
        print(f"📁 File: {test_file_path}")
        print(f"🌐 URL: {url}")
        
        # Open file and make request
        with open(test_file_path, 'rb') as f:
            files = {'file': (test_file_path, f, 'text/csv')}
            
            print(f"\n📤 Uploading file...")
            response = requests.post(url, files=files)
            
            print(f"\n📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n✅ SUCCESS! Response received:")
                print(f"📋 Response Keys: {list(data.keys())}")
                
                # Check if pinecone_tests exists in response
                if 'pinecone_tests' in data:
                    print(f"\n🎯 PINECONE TESTS FOUND!")
                    pinecone_tests = data['pinecone_tests']
                    print(f"🔍 Pinecone Tests Type: {type(pinecone_tests)}")
                    print(f"📊 Number of Tests: {len(pinecone_tests) if isinstance(pinecone_tests, dict) else 'N/A'}")
                    
                    if isinstance(pinecone_tests, dict):
                        print(f"\n📝 Test Results:")
                        for test_id, test_data in pinecone_tests.items():
                            status = test_data.get('status', 'UNKNOWN')
                            name = test_data.get('name', 'Unknown Test')
                            details = test_data.get('details', 'No details')
                            emoji = "✅" if status == "PASSED" else "❌"
                            print(f"{emoji} {test_id}: {status} - {name}")
                            print(f"   Details: {details}")
                    else:
                        print(f"⚠️ Pinecone tests data is not a dictionary: {pinecone_tests}")
                        
                else:
                    print(f"\n❌ PINECONE TESTS MISSING!")
                    print(f"📋 Available fields: {list(data.keys())}")
                    
                # Print full response for debugging
                print(f"\n🔍 FULL RESPONSE DEBUG:")
                print(json.dumps(data, indent=2))
                
            else:
                print(f"\n❌ FAILED! Status: {response.status_code}")
                print(f"Error: {response.text}")
                
    except Exception as e:
        print(f"\n💥 ERROR: {e}")

if __name__ == "__main__":
    test_file_upload_with_mock_pinecone()
