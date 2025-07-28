#!/usr/bin/env python3
"""
Test script to call Data Profile Agent with known file ID
"""
import requests

# Known file ID from upload logs
file_id = "1753707490_test_data.csv"

print(f"🤖 Testing Data Profile Agent with file_id: {file_id}")

try:
    profile_request = {
        'file_id': file_id,
        'query': 'Analyze this data file structure and quality'
    }
    
    headers = {'x-client-version': '1.0.0'}
    
    response = requests.post(
        'http://localhost:8000/api/v1/agents/data_profile/run',
        json=profile_request,
        headers=headers,
        timeout=180
    )
    
    print(f"Profile Status: {response.status_code}")
    if response.status_code == 200:
        profile_result = response.json()
        print(f"✅ Profile Success!")
        print(f"Response keys: {list(profile_result.keys())}")
        if 'result' in profile_result:
            print(f"Result keys: {list(profile_result['result'].keys())}")
        print(f"Full response: {profile_result}")
    else:
        print(f"❌ Profile Error: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")

print("\n🏁 Profile test complete")
