from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json
from pydantic import BaseModel
load_dotenv()

from services.vertex_wrapper import vertex_speak
from services.elevenlab_tts import text_to_speech
from services.session_manager import (
    start_session,
    add_message,
    get_session,
    end_session
)
from services.github_parser import fetch_github_profile
from services.context_builder import build_candidate_context
from services.emotion import text_emotion, audio_emotion
from services.camera import analyze_camera_frame
from services.elevenlab_stt import speech_to_text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartResponse(BaseModel):
    session_id: str
    question: str

class AnswerRequest(BaseModel):
    session_id: str
    answer: str
    skill: str
    project: str | None = None

# ---------- TTS ----------
from fastapi import Query

@app.get("/tts")
def tts(text: str = Query(...)):
    return text_to_speech(text)

# ---------- CAMERA ----------
@app.post("/camera/analyze")
async def camera(frame: UploadFile = File(...)):
    return await analyze_camera_frame(frame)

# ---------- START INTERVIEW ----------
import uuid

@app.get("/start-interview/{username}")
def start_interview(username: str):
    profile = fetch_github_profile(username)
    if "error" in profile:
        return profile

    github_context = build_candidate_context(profile)

    greeting_prompt = f"""
You are a friendly but professional technical interviewer.

Candidate context:
{github_context}

Start the interview.
Greet the candidate naturally.
Explain interview flow briefly.
Do not ask technical questions yet.
"""

    greeting = vertex_speak(greeting_prompt)

    # 🔑 ALWAYS create a session_id
    session_id = str(uuid.uuid4())

    # 🧠 Store everything needed for the interview
    start_session(
        session_id=session_id,
        github_context=github_context,
        skill="Frontend / Fullstack",   # can be dynamic later
        project="AI Interviewer",
        first_message=greeting["text"]
    )

    return {
        "session_id": session_id,
        "question": greeting["text"],
        "tts_url": greeting["tts_url"]
    }


# ---------- ANSWER ----------
from services.vertex_wrapper import evaluate_answer

@app.post("/answer")
async def answer(
    session_id: str = Form(...),
    answer: str | None = Form(None),
    metrics: str | None = Form(None),
    file: UploadFile | None = File(None)
):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=400, detail="No active session")

    transcript = answer or ""
    audio_em = None

    if file:
        audio_bytes = await file.read()
        transcript = speech_to_text(audio_bytes)
        audio_em = audio_emotion(audio_bytes)

    text_em = text_emotion(transcript)
    camera_metrics = json.loads(metrics) if metrics else {}

    # store answer
    add_message(
        session_id,
        "candidate",
        transcript,
        text_emotion=text_em,
        audio_emotion=audio_em,
        camera_metrics=camera_metrics
    )

    # 🔥 CORE AI BRAIN
    result = evaluate_answer(
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
        "text": text
    }

from fastapi.responses import StreamingResponse
from services.elevenlab_tts import stream_tts

@app.get("/tts/stream")
def tts_stream(text: str):
    return StreamingResponse(
        stream_tts(text),
        media_type="audio/mpeg"
    )

from services.emotion import text_emotion, audio_emotion
'''
@app.post("/interview/answer")
async def interview_answer(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()

    # 1️⃣ Speech → Text
    user_text = speech_to_text(audio_bytes)

    # 2️⃣ Emotion analysis
    text_em = text_emotion(user_text)
    audio_em = audio_emotion(audio_bytes)

    # 3️⃣ Fuse emotions (simple, explainable)
    if audio_em["score"] > 0.6 and text_em["emotion"] == "happy":
        final_emotion = "confident"
    elif audio_em["score"] < 0.4 or text_em["emotion"] == "concerned":
        final_emotion = "nervous"
    else:
        final_emotion = "neutral"

    # 4️⃣ Adaptive question
    if final_emotion == "nervous":
        next_question = "No worries. Can you explain a project you enjoyed working on?"
    elif final_emotion == "confident":
        next_question = "Great. Can you explain a challenging technical decision you made?"
    else:
        next_question = "Can you tell me more about your technical experience?"

    return {
        "user_text": user_text,
        "emotion": {
            "final": final_emotion,
            "text": text_em,
            "audio": audio_em
        },
        "next_question": next_question
    }
'''