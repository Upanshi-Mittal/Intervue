import requests
import os

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "Rachel"

def text_to_speech(text, emotion="neutral"):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.4,
            "similarity_boost": 0.7
        }
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code != 200:
        return {"error": response.text}

    return response.content
