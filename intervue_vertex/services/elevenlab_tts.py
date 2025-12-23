import os
from elevenlabs.client import ElevenLabs

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

VOICE_ID = "UgBBYS2sOqTuMpoF3BR0"

def text_to_speech(text: str) -> bytes:
    if not text or not text.strip():
        return b""

    try:
        audio = client.text_to_speech.convert(
            voice_id=VOICE_ID,
            text=text
        )

        # SDK returns bytes OR generator depending on version
        if isinstance(audio, (bytes, bytearray)):
            return audio

        return b"".join(audio)

    except Exception as e:
        print("❌ ElevenLabs TTS ERROR:", e)
        return b""
