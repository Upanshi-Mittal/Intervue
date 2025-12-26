import os
import requests
from io import BytesIO
from fastapi.responses import StreamingResponse

ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Rachel

def text_to_speech(text: str):
    if not ELEVEN_API_KEY:
        raise Exception("ELEVENLABS_API_KEY not loaded")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

    headers = {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "text": text,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.7
        }
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        raise Exception(response.text)

    audio = BytesIO(response.content)
    audio.seek(0)

    return StreamingResponse(audio, media_type="audio/mpeg")

import os
import requests

ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

def stream_tts(text: str):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream"

    headers = {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.4,
            "similarity_boost": 0.7
        }
    }

    response = requests.post(url, json=payload, headers=headers, stream=True)

    for chunk in response.iter_content(chunk_size=4096):
        if chunk:
            yield chunk
