import json
import requests

endpoint = 'http://127.0.0.1:8000/api/posts/new/'

result = requests.post(endpoint, json={'content': 'YO',})
print(result.json())