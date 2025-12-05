from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from services.elevenlabs import text_to_speech
from services.github_parser import fetch_github_profile
from fastapi import UploadFile, File, Form
from services.session_manager import get_session, update_session, end_session
from services.vertex_wrapper import evaluate_answer
from services.emotion import text_emotion, audio_emotion
from services.stt import speech_to_text

app = FastAPI()

MAX_QUESTIONS = 6
class AnswerInput(BaseModel):
    answer: str
    skill: str | None = None
    project: str | None = None

@app.get("/")
def home():
    return {"status": "backend running"}

@app.get("/github/{username}")
def github(username: str):
    return fetch_github_profile(username)

@app.get("/start-interview/{username}")
def start_interview(username: str):
    profile = fetch_github_profile(username)

    if "error" in profile:
        return profile

    skills = profile.get("skills", [])
    projects = profile.get("top_projects", [])

    if not skills:
        return {"error": "No skills detected"}

    main_skill = skills[0]

    project_name = None
    if projects:
        project_name = projects[0]["name"]

    if project_name:
        question = f"Tell me about your {main_skill} project '{project_name}'."
    else:
        question = f"Tell me about your experience with {main_skill}."
    start_session(username, main_skill, project_name)
    return {
        "question": question,
        "skill_focus": main_skill,
        "project": project_name,
        "mode": "friendly"
    }

@app.post("/speak")
def speak(text: str):
    audio_bytes = text_to_speech(text)

    return StreamingResponse(
        iter([audio_bytes]),
        media_type="audio/mpeg"
    )

@app.post("/answer")
async def answer_api(
    username: str = Form(...),
    answer: str | None = Form(None),
    file: UploadFile | None = File(None),
    metrics: str | None = Form(None),
    skill: str | None = Form(None),
    project: str | None = Form(None)
):
    session = get_session(username)
    if not session:
        return {"error": "No active interview session. Call /start-interview/{username}"}

    camera_metrics = None
    if metrics:
        try:
            camera_metrics = json.loads(metrics)
        except:
            camera_metrics = {"error": "invalid_metrics"}

    transcript = None
    audio_em = None
    if file is not None:
        audio_bytes = await file.read()
        try:
            from services.stt import speech_to_text
            transcript = speech_to_text(audio_bytes)
        except Exception as e:
            transcript = ""
        try:
            from services.emotion import audio_emotion
            audio_em = audio_emotion(audio_bytes)
        except:
            audio_em = None
    else:
        transcript = answer

    from services.emotion import text_emotion
    text_em = text_emotion(transcript or "")

    eval_data = evaluate_answer(transcript or "", session["skill"], session["project"])

    last_question = session["turns"][-1]["question"] if session["turns"] else "initial"
    update_session(
        username,
        last_question,
        transcript or "",
        evaluation=eval_data,
        text_em=text_em,
        audio_em=audio_em
    )

    if camera_metrics is not None:
        s = get_session(username)
        if s and s["turns"]:
            s["turns"][-1]["camera_metrics"] = camera_metrics

    if s["count"] >= MAX_QUESTIONS:
        end_session(username)
        from services.report import make_report
        report = make_report(s)
        return {"status": "finished", "evaluation": eval_data, "report": report}

    next_q = eval_data.get("next_question") if isinstance(eval_data, dict) else None
    if not next_q:
        next_q = "Can you elaborate more on that?"
    return {"status": "ongoing", "evaluation": eval_data, "next_question": next_q}


@app.post("/stt")
async def stt_endpoint(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    text = speech_to_text(audio_bytes)
    return {"text": text}
