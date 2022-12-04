import requests

endpoint = 'http://127.0.0.1:8000/api/users/1/'
request_response = requests.get(endpoint)
print(request_response.json())