import requests
import json

url = "http://localhost:8000/api/v1/files/upload"
files = {'file': ('test.csv', 'name,age\nJohn,25', 'text/csv')}

response = requests.post(url, files=files)
print("Status:", response.status_code)
print("Response:", response.text)
