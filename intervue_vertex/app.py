from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from dotenv import load_dotenv
load_dotenv()
from services.github_parser import fetch_github_profile
from services.elevenlab_tts import text_to_speech
from services.session_manager import (
    start_session,
    get_session,
    update_session,
    end_session
)
from services.vertex_wrapper import evaluate_answer
from services.emotion import text_emotion, audio_emotion
from services.stt import speech_to_text
from services.camera import analyze_camera_frame
from services.report import make_report

app = FastAPI()
MAX_QUESTIONS = 6
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/camera/analyze")
async def camera_analyze(frame: UploadFile = File(...)):
    return await analyze_camera_frame(frame)

@app.get("/")
def home():
    return {"status": "backend running"}

class GithubRequest(BaseModel):
    username: str

@app.post("/parse-github")
def parse_github(data: GithubRequest):
    return fetch_github_profile(data.username)

@app.get("/start-interview/{username}")
def start_interview(username: str):
    profile = fetch_github_profile(username)
    if "error" in profile:
        return profile

    skills = profile.get("skills", [])
    projects = profile.get("top_projects", [])

    if not skills:
        return {"error": "No skills detected"}

    skill = skills[0]
    project = projects[0]["name"] if projects else None

    question = (
        f"Tell me about your {skill} project '{project}'."
        if project else
        f"Tell me about your experience with {skill}."
    )

    start_session(username, skill, project, question)

    return {
        "session_id":username,
        "question": question,
        "skill_focus": skill,
        "project": project
    }

@app.post("/speak")
def speak(text: str = Form(...)):
    audio_bytes = text_to_speech(text)
    return StreamingResponse(iter([audio_bytes]), media_type="audio/mpeg")

@app.post("/answer")
async def answer_api(
    username: str = Form(...),
    answer: str | None = Form(None),
    file: UploadFile | None = File(None),
    metrics: str | None = Form(None)
):
    print("🔥 /answer HIT")
    session = get_session(username)
    if not session:
        return {"error": "No active interview session"}

    # 🎥 Camera metrics
    camera_metrics = None
    if metrics:
        try:
            camera_metrics = json.loads(metrics)
        except:
            camera_metrics = {"error": "invalid_metrics"}

    # 🎤 Audio / text
    transcript = answer or ""
    audio_em = None

    if file:
        audio_bytes = await file.read()
        transcript = speech_to_text(audio_bytes) or ""
        audio_em = audio_emotion(audio_bytes)

    # 🧠 Text emotion
    text_em = text_emotion(transcript)

    # 🤖 LLM evaluation
    eval_data = evaluate_answer(
        transcript,
        session["skill"],
        session["project"]
    )

    # 🧠 Update session
    update_session(
        username=username,
        answer=transcript,
        evaluation=eval_data,
        text_em=text_em,
        audio_em=audio_em,
        camera_metrics=camera_metrics
    )

    # 🏁 End interview
    if session["count"] >= MAX_QUESTIONS:
        end_session(username)
        return {
            "status": "finished",
            "report": make_report(session)
        }

    # ❓ Next question
    next_question = eval_data.get(
        "next_question",
        "Can you elaborate on that?"
    )

    return {
        "status": "ongoing",
        "evaluation": eval_data,
        "text_emotion": text_em,
        "audio_emotion": audio_em,
        "next_question": next_question
    }

import io
@app.post("/speak")
def speak(text: str = Form(...)):
    audio_bytes = text_to_speech(text)

    print("🔊 Audio size:", len(audio_bytes))

    if not audio_bytes:
        return {"error": "TTS failed"}

    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg"
    )




