"""
ai_fallback.py — Multi-provider AI fallback chain.

Order of priority:
  1. Groq       (Llama 3.3 70B) — fastest, 14,400 req/day free
  2. Gemini     (Flash 2.0)     — reliable, 1,500 req/day free
  3. HuggingFace (Llama 3 8B)  — unlimited but slower
  4. Static fallback            — always works, returns a safe default

Usage:
    from services.ai_fallback import ai_generate, ai_generate_json
"""

import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# Provider 1 — Groq
# ─────────────────────────────────────────────

def _try_groq(prompt: str, system: str, want_json: bool) -> str | None:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return None

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        kwargs = dict(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.4 if want_json else 0.7,
            max_tokens=1024,
        )
        if want_json:
            kwargs["response_format"] = {"type": "json_object"}

        resp = client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"[AI] Groq failed: {e}")
        return None


# ─────────────────────────────────────────────
# Provider 2 — Gemini Flash
# ─────────────────────────────────────────────

def _try_gemini(prompt: str, system: str, want_json: bool) -> str | None:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        full_prompt = f"{system}\n\n{prompt}"
        if want_json:
            full_prompt += "\n\nRespond with ONLY valid JSON, no markdown."

        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                temperature=0.4 if want_json else 0.7,
                max_output_tokens=1024,
            ),
        )
        return resp.text.strip()
    except Exception as e:
        print(f"[AI] Gemini failed: {e}")
        return None


# ─────────────────────────────────────────────
# Provider 3 — HuggingFace Inference API
# ─────────────────────────────────────────────

def _try_huggingface(prompt: str, system: str, want_json: bool) -> str | None:
    api_key = os.getenv("HF_API_KEY", "")
    # HuggingFace has some models available without a key too
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        full_prompt = f"<|system|>{system}</s><|user|>{prompt}</s><|assistant|>"
        if want_json:
            full_prompt += "\nJSON only:\n{"

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.4 if want_json else 0.7,
                "return_full_text": False,
            },
        }
        resp = requests.post(
            "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
            headers=headers,
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        if isinstance(data, list) and data:
            text = data[0].get("generated_text", "").strip()
            if want_json and not text.startswith("{"):
                text = "{" + text
            return text
        return None
    except Exception as e:
        print(f"[AI] HuggingFace failed: {e}")
        return None


# ─────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────

_PROVIDERS_TEXT = [_try_groq, _try_gemini, _try_huggingface]
_PROVIDERS_JSON = [_try_groq, _try_gemini, _try_huggingface]


def ai_generate(
    prompt: str,
    system: str = "You are a helpful, concise assistant.",
) -> str:
    """
    Generate plain text. Tries each provider in order until one succeeds.
    """
    for provider in _PROVIDERS_TEXT:
        result = provider(prompt, system, want_json=False)
        if result:
            return result

    # All providers failed — return a safe fallback
    print("[AI] ⚠️  All providers failed. Using static fallback.")
    return "Let's continue. Could you tell me more about your technical background?"


def ai_generate_json(
    prompt: str,
    system: str = "You are a helpful assistant. Always respond with valid JSON only.",
) -> dict:
    """
    Generate structured JSON. Tries each provider in order until one succeeds.
    Automatically cleans and parses the JSON.
    """
    for provider in _PROVIDERS_JSON:
        raw = provider(prompt, system, want_json=True)
        if not raw:
            continue
        try:
            # Extract JSON even if there's surrounding text
            start = raw.find("{")
            end   = raw.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(raw[start:end])
        except Exception as e:
            print(f"[AI] JSON parse failed for provider output: {e}")
            continue

    # All providers failed — return a safe evaluation default
    print("[AI] ⚠️  All providers failed. Using static JSON fallback.")
    return {
        "score": 5,
        "confidence_level": "medium",
        "communication_feedback": "Could not evaluate at this time.",
        "technical_feedback": "Could not evaluate at this time.",
        "strengths": [],
        "weaknesses": [],
        "next_question": "Could you elaborate on your previous answer?",
        "interviewer_tone": "neutral",
    }
