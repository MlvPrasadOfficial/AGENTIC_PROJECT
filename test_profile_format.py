import requests
import json

def test_data_profile_output_format():
    """Test the Data Profile Agent to verify the new tagged output format"""
    
    # First upload a test file
    print("=== UPLOADING TEST FILE ===")
    
    # Create test data
    test_data = "name,age,salary,department\nJohn,25,50000,Engineering\nJane,30,60000,Marketing\nBob,35,70000,Engineering\nAlice,28,55000,HR\nCharlie,32,65000,Sales"
    
    # Upload file
    files = {'file': ('test_profile.csv', test_data, 'text/csv')}
    upload_response = requests.post('http://localhost:8000/api/v1/files/upload', files=files)
    
    if upload_response.status_code == 200:
        upload_data = upload_response.json()
        file_id = upload_data['file_id']
        print(f"✅ File uploaded successfully: {file_id}")
        
        # Test Data Profile Agent
        print("\n=== TESTING DATA PROFILE AGENT ===")
        
        profile_payload = {
            "query": "Profile this data",
            "file_id": file_id,
            "context_data": {}
        }
        
        profile_response = requests.post(
            'http://localhost:8000/api/v1/agents/data_profile/run',
            json=profile_payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {profile_response.status_code}")
        
        if profile_response.status_code == 200:
            data = profile_response.json()
            print(f"Agent Status: {data.get('status')}")
            
            if data.get('status') == 'success' and data.get('result'):
                result = data['result']
                print("\n🎯 CHECKING OUTPUT FORMAT:")
                
                if 'output' in result:
                    output = result['output']
                    
                    print("\n📄 PLACEHOLDER OUTPUT:")
                    placeholder = output.get('placeholder', '')
                    placeholder_lines = placeholder.split('\n')
                    for i, line in enumerate(placeholder_lines):
                        tag_check = "✅" if line.startswith('[placeholder]') else "❌"
                        print(f"  {tag_check} Line {i+1}: {line}")
                    
                    print("\n📄 REAL OUTPUT:")
                    real = output.get('real', '')
                    real_lines = real.split('\n')
                    for i, line in enumerate(real_lines):
                        tag_check = "✅" if line.startswith('[real]') else "❌"
                        print(f"  {tag_check} Line {i+1}: {line}")
                    
                    # Check if all lines are properly tagged
                    all_placeholder_tagged = all(line.startswith('[placeholder]') for line in placeholder_lines if line.strip())
                    all_real_tagged = all(line.startswith('[real]') for line in real_lines if line.strip())
                    
                    print(f"\n🏆 FINAL RESULTS:")
                    print(f"  All placeholder lines tagged: {'✅ YES' if all_placeholder_tagged else '❌ NO'}")
                    print(f"  All real lines tagged: {'✅ YES' if all_real_tagged else '❌ NO'}")
                    print(f"  Total real lines: {len([l for l in real_lines if l.strip()])}")
                    print(f"  Total placeholder lines: {len([l for l in placeholder_lines if l.strip()])}")
                    
                else:
                    print("❌ No 'output' field in result")
            else:
                print(f"❌ Agent failed or no result: {data.get('message')}")
        else:
            print(f"❌ Profile agent failed: {profile_response.text}")
    else:
        print(f"❌ File upload failed: {upload_response.text}")

if __name__ == "__main__":
    test_data_profile_output_format()
