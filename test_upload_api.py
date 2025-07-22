import requests
import json

# Test file upload to see if we get real Pinecone test results
response = requests.post(
    'http://localhost:8000/api/v1/files/upload',
    files={'file': open('test_upload_debug.csv', 'rb')}
)

print(f"Status Code: {response.status_code}")
print(f"Response Headers: {dict(response.headers)}")

if response.status_code == 200:
    data = response.json()
    print(f"\nFile ID: {data.get('file_id', 'N/A')}")
    print(f"Filename: {data.get('filename', 'N/A')}")
    print(f"Status: {data.get('status', 'N/A')}")
    print(f"Message: {data.get('message', 'N/A')}")
    
    # Check if we have Pinecone test results
    pinecone_tests = data.get('pinecone_tests')
    if pinecone_tests:
        print(f"\n✅ PINECONE TESTS FOUND! ({len(pinecone_tests)} tests)")
        for test_id, test_result in pinecone_tests.items():
            status_emoji = "✅" if test_result.get("status") == "PASSED" else "❌"
            print(f"{status_emoji} {test_id}: {test_result.get('name', 'Unknown')} - {test_result.get('status', 'Unknown')}")
            print(f"   Details: {test_result.get('details', 'No details')}")
    else:
        print("\n❌ NO PINECONE TESTS FOUND")
        
else:
    print(f"Error: {response.text}")
