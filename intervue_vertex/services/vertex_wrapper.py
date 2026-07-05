"""
vertex_wrapper.py — Drop-in replacement using the AI fallback chain.
Function name kept as evaluate_answer() so app.py imports still work.
"""
import json
from services.ai_fallback import ai_generate_json


def evaluate_answer(
    answer: str,
    skill: str,
    project: str | None,
    github_summary: dict | None = None,
    camera_metrics: dict | None = None,
    audio_emotion: dict | None = None,
    text_emotion: dict | None = None,
) -> dict:
    system = (
        "You are a senior technical interviewer with human-like judgment. "
        "Always respond with valid JSON only — no markdown, no text outside JSON."
    )

    prompt = f"""
You are evaluating a candidate in a live technical interview.

Candidate Profile:
- Skill focus: {skill}
- Project: {project or "N/A"}

GitHub Signals:
{json.dumps(github_summary, indent=2) if github_summary else "Not available"}

Camera Behavior:
{json.dumps(camera_metrics, indent=2) if camera_metrics else "Not available"}

Audio Emotion:
{json.dumps(audio_emotion, indent=2) if audio_emotion else "Not available"}

Text Emotion:
{json.dumps(text_emotion, indent=2) if text_emotion else "Not available"}

Candidate Answer:
{answer}

TASK:
1. Judge technical correctness
2. Judge confidence & communication
3. Adapt interviewer tone
4. Decide next best question (keep it concise, one sentence)

Return ONLY this JSON:

{{
  "score": <integer 0-10>,
  "confidence_level": "low | medium | high",
  "communication_feedback": "<one sentence>",
  "technical_feedback": "<one sentence>",
  "strengths": ["<strength1>"],
  "weaknesses": ["<weakness1>"],
  "next_question": "<next interview question>",
  "interviewer_tone": "encouraging | neutral | challenging"
}}
"""
    return ai_generate_json(prompt, system=system)
