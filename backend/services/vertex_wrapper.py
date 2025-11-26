import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(project="intervue-479409", location="us-central1")

model = GenerativeModel("gemini-1.5-flash")

def evaluate_answer(answer, profile_data=""):
    prompt = f"""
    You are an AI interview evaluator.
    Evaluate this answer briefly and return JSON ONLY:

    Answer: {answer}
    Profile: {profile_data}

    Return JSON:
    {{
        "performance": "good" | "average" | "weak",
        "emotion": "happy" | "neutral" | "concerned",
        "feedback": "short sentence",
        "next_question": "one followup question"
    }}
    """

    response = model.generate_content(prompt)
    return response.text
