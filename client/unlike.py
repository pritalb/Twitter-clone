import requests

endpoint = 'http://127.0.0.1:8000/api/post/1/unlike/'
request_response = requests.put(endpoint)
print(request_response.json())