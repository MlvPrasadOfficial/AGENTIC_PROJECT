import requests

url = "http://localhost:8000/api/v1/files/upload"
files = {'file': ('final_test.csv', 'name,age\nJohn,25\nAlice,30', 'text/csv')}

response = requests.post(url, files=files)
print("Status:", response.status_code)

if response.status_code == 200:
    data = response.json()
    print("Response keys:", list(data.keys()))
    if 'pinecone_tests' in data:
        print("✅ PINECONE TESTS FOUND!")
        print("Number of tests:", len(data['pinecone_tests']))
        for test_id, test_data in data['pinecone_tests'].items():
            print(f"  {test_id}: {test_data.get('status', 'UNKNOWN')}")
    else:
        print("❌ No pinecone_tests in response")
        print("Available fields:", list(data.keys()))
else:
    print("Error:", response.text)
