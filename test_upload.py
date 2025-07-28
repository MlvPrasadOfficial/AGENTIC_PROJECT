#!/usr/bin/env python3
"""
Test script to upload a file and then call the Data Profile Agent
"""
import requests
import time

# Create a test CSV file
test_data = """name,age,city,salary
John,25,NYC,50000
Jane,30,LA,60000
Bob,35,Chicago,55000
Alice,28,Miami,52000
"""

# Write test data to file
with open('test_data.csv', 'w') as f:
    f.write(test_data)

print("✅ Created test_data.csv")

# Test 1: Upload the file
print("\n🔧 Testing file upload...")
try:
    with open('test_data.csv', 'rb') as f:
        files = {'file': ('test_data.csv', f, 'text/csv')}
        headers = {'x-client-version': '1.0.0'}
        
        response = requests.post(
            'http://localhost:8000/api/v1/files/upload',
            files=files,
            headers=headers,
            timeout=30
        )
        
    print(f"Upload Status: {response.status_code}")
    if response.status_code == 200:
        upload_result = response.json()
        print(f"✅ Upload Success: {upload_result}")
        file_id = upload_result.get('file_uploaded', {}).get('fileId')
        print(f"📁 File ID: {file_id}")
        
        # Test 2: Call Data Profile Agent
        if file_id:
            print(f"\n🤖 Testing Data Profile Agent with file_id: {file_id}")
            profile_request = {
                'file_id': file_id,
                'query': 'Analyze this data file structure and quality'
            }
            
            profile_response = requests.post(
                'http://localhost:8000/api/v1/agents/data_profile/run',
                json=profile_request,
                headers=headers,
                timeout=180
            )
            
            print(f"Profile Status: {profile_response.status_code}")
            if profile_response.status_code == 200:
                profile_result = profile_response.json()
                print(f"✅ Profile Success: {profile_result}")
            else:
                print(f"❌ Profile Error: {profile_response.text}")
        else:
            print("❌ No file_id returned from upload")
    else:
        print(f"❌ Upload Error: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")

print("\n🏁 Test complete")
