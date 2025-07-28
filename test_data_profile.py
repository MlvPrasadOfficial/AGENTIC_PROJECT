import requests
import json

# Test Data Profile Agent API
def test_data_profile_agent():
    url = "http://localhost:8000/api/v1/agents/data_profile/run"
    
    payload = {
        "query": "Profile this data",
        "file_id": "1753682539_test_profile_data.csv",
        "context_data": {}
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # Check if the response contains LLM output
        data = response.json()
        if "result" in data and data["result"]:
            result = data["result"]
            print("\n=== CHECKING FOR LLM OUTPUT ===")
            print(f"Has insights: {'insights' in result}")
            print(f"Has output tags: {'output' in result}")
            
            if "output" in result:
                output = result["output"]
                print(f"Placeholder: {output.get('placeholder', 'N/A')}")
                print(f"Real: {output.get('real', 'N/A')}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_data_profile_agent()
