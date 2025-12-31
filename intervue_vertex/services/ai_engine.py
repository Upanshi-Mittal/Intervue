from google import genai
import os
import json

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def evaluate_answer(payload: dict):
    prompt = f"""
You are a senior technical interviewer.

Context:
{json.dumps(payload, indent=2)}

Return ONLY valid JSON:
{{
  "score": 0-10,
  "confidence_level": "low | medium | high",
  "communication_feedback": "",
  "technical_feedback": "",
  "strengths": [],
  "weaknesses": [],
  "next_question": "",
  "interviewer_tone": "encouraging | neutral | challenging"
}}
"""

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = resp.text.strip()
    return json.loads(text[text.find("{"):text.rfind("}")+1])
