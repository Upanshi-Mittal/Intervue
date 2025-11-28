import os
from elevenlabs.client import ElevenLabs

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

def speech_to_text(audio_bytes):
    result = client.speech_to_text.convert(
        file=(audio_bytes, "audio.mp3"),
        model_id="scribe_v1",
    )

    return result["text"]
