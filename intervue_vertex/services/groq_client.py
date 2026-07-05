import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set in environment")
        _client = Groq(api_key=api_key)
    return _client


def groq_generate(prompt: str, system: str = "You are a helpful assistant.") -> str:
    """
    Generate a plain text response from Llama 3 via Groq.
    """
    client = get_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content.strip()


def groq_generate_json(prompt: str, system: str = "You are a helpful assistant. Always respond with valid JSON only.") -> dict:
    """
    Generate a structured JSON response from Llama 3 via Groq.
    Automatically parses and returns the dict.
    """
    client = get_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    text = response.choices[0].message.content.strip()
    return json.loads(text)
