import os
from elevenlabs.client import ElevenLabs
from services.audio_utils import webm_to_wav

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)


def speech_to_text(audio_bytes: bytes) -> str:
    try:
        wav_bytes = webm_to_wav(audio_bytes)

        result = client.speech_to_text.convert(
            file=(wav_bytes, "audio.wav"),
            model_id="scribe_v1",
        )

        return result.get("text", "").strip()

    except Exception as e:
        print("ElevenLabs STT failed:", e)
        return ""
