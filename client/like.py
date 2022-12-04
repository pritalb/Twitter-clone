import requests

endpoint = 'http://127.0.0.1:8000/api/posts/1/like/'
request_response = requests.put(endpoint)
print(request_response.json())