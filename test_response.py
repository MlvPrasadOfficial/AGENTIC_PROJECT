import requests
import json

# Test the upload API and print detailed response
try:
    with open('test_debug_2.csv', 'rb') as f:
        response = requests.post(
            'http://localhost:8000/api/v1/files/upload',
            files={'file': f}
        )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n=== RESPONSE DATA ===")
        print(json.dumps(data, indent=2))
        
        if 'pinecone_tests' in data:
            print("\n✅ Pinecone tests found in response!")
            print(f"Number of tests: {len(data['pinecone_tests'])}")
        else:
            print("\n❌ No pinecone_tests in response")
            print(f"Available keys: {list(data.keys())}")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Exception: {e}")
