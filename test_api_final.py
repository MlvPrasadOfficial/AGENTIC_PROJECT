import requests
import json
import time

# Create a unique test file
test_content = f"""name,value,category
Test{int(time.time())},100,A
Sample,200,B
Data,300,C"""

with open('test_api_response.csv', 'w') as f:
    f.write(test_content)

print("📁 Created test file: test_api_response.csv")
print("🚀 Uploading to backend...")

try:
    with open('test_api_response.csv', 'rb') as f:
        response = requests.post(
            'http://localhost:8000/api/v1/files/upload',
            files={'file': f}
        )
    
    print(f"\n📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Upload successful!")
        print(f"📋 File ID: {data.get('file_id', 'N/A')}")
        print(f"📄 Filename: {data.get('filename', 'N/A')}")
        print(f"📊 Status: {data.get('status', 'N/A')}")
        print(f"💬 Message: {data.get('message', 'N/A')}")
        
        # Check for pinecone_tests in the response
        pinecone_tests = data.get('pinecone_tests')
        if pinecone_tests:
            print(f"\n🎯 PINECONE TESTS FOUND! ({len(pinecone_tests)} tests)")
            for test_id, test_data in pinecone_tests.items():
                status = test_data.get('status', 'Unknown')
                name = test_data.get('name', 'Unknown Test')
                details = test_data.get('details', 'No details')
                emoji = "✅" if status == "PASSED" else "❌"
                print(f"{emoji} {test_id}: {name}")
                print(f"   Status: {status}")
                print(f"   Details: {details}")
        else:
            print(f"\n❌ NO PINECONE_TESTS IN RESPONSE")
            print(f"🔍 Available response keys: {list(data.keys())}")
            print(f"\n📜 Full response:")
            print(json.dumps(data, indent=2, default=str))
    else:
        print(f"❌ Upload failed with status {response.status_code}")
        print(f"📄 Response: {response.text}")
        
except Exception as e:
    print(f"💥 Exception: {e}")
