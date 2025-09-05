import requests
import json

api_key = "gsk_rxZMjDvDfXQmQIsfsDYWWGdyb3FYDAzA9Gf8hm98jTiCtPhatpB"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Say hello in 3 languages"}]
}

response = requests.post(
    "https://api.groq.com/openai/v1/chat/completions",
    headers=headers,
    json=data
)

print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
