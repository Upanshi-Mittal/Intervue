"""
gemini_client.py — Drop-in replacement using the AI fallback chain.
Function name kept as gemini_generate() so app.py imports still work.
"""
from services.ai_fallback import ai_generate


def gemini_generate(prompt: str) -> str:
    system = (
        "You are a professional technical interviewer. "
        "Keep your responses concise and conversational. "
        "Do not give long paragraphs — use short, natural sentences."
    )
    return ai_generate(prompt, system=system)
