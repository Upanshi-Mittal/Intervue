import os
import json
import vertexai
from vertexai.generative_models import GenerativeModel

_model = None


def get_model():
    global _model
    if _model is None:
        vertexai.init(
            project=os.getenv("GCP_PROJECT_ID"),
            location="us-central1"
        )
        _model = GenerativeModel("gemini-1.5-pro")
    return _model


def evaluate_answer(
    answer: str,
    skill: str,
    project: str | None,
    github_summary: dict | None = None,
    camera_metrics: dict | None = None,
    audio_emotion: dict | None = None,
    text_emotion: dict | None = None
):
    model = get_model()

    prompt = f"""
You are a senior technical interviewer with human-like judgment.

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
4. Decide next best question

Return ONLY valid JSON:

{{
  "score": 0-10,
  "confidence_level": "low | medium | high",
  "communication_feedback": "...",
  "technical_feedback": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "next_question": "...",
  "interviewer_tone": "encouraging | neutral | challenging"
}}
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        json_text = text[text.find("{"): text.rfind("}") + 1]
        data = json.loads(json_text)

        return data

    except Exception:
        return {
            "score": 5,
            "confidence_level": "medium",
            "communication_feedback": "",
            "technical_feedback": "",
            "strengths": [],
            "weaknesses": ["Unable to evaluate clearly."],
            "next_question": "Could you explain that in a bit more detail?",
            "interviewer_tone": "neutral"
        }
def vertex_speak(text: str):
    """
    TEMP: placeholder TTS
    Replace later with real Vertex TTS
    """
    model = get_model()
    response = model.generate_content(text)

    return {
        "text": response.text.strip(),
        "tts_url": None
    }
