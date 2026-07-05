from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import uuid, json, traceback

load_dotenv()

# ===== SERVICES =====
from services.gemini_client import gemini_generate
from services.elevenlab_tts import stream_tts
from services.elevenlab_stt import speech_to_text
from services.session_manager import start_session, add_message, get_session
from services.github_parser import fetch_github_profile
from services.context_builder import build_candidate_context
from services.emotion import text_emotion
from services.vertex_wrapper import evaluate_answer  # Gemini inside

# ===== APP =====
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== TTS ==================
@app.get("/tts")
def tts(text: str):
    return StreamingResponse(
        stream_tts(text),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-store",
            "Accept-Ranges": "bytes"
        }
    )


# ================== STT ==================
@app.post("/stt/live")
async def live_stt(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        text = speech_to_text(audio_bytes)
        return {"text": text or ""}
    except Exception:
        traceback.print_exc()
        return {"text": ""}

# ================== START INTERVIEW ==================
@app.get("/start-interview/{username}")
def start_interview(username: str):
    try:
        # 🔥 GitHub OPTIONAL
        profile = fetch_github_profile(username)
        github_context = (
            build_candidate_context(profile)
            if profile else
            "No GitHub data available."
        )

        greeting = gemini_generate(
            f"""
You are a professional technical interviewer.

Candidate background:
{username}

Greet the candidate.
Explain interview flow briefly.
Do not ask technical questions yet.
also donot give big para try to keep sentence small and concise
"""
        )

        if not greeting:
            raise Exception("Gemini returned empty greeting")

        session_id = str(uuid.uuid4())

        start_session(
            session_id=session_id,
            github_context=github_context,
            skill="Fullstack",
            project="AI Interviewer",
            first_message=greeting
        )

        return {
            "session_id": session_id,
            "question": greeting
        }

    except Exception:
        traceback.print_exc()
        raise HTTPException(500, "Failed to start interview")

# ================== ANSWER ==================
@app.post("/answer")
async def answer(
    session_id: str = Form(...),
    answer: str = Form(""),
    metrics: str | None = Form(None),
):
    try:
        session = get_session(session_id)
        if not session:
            raise HTTPException(400, "No active session")

        transcript = answer.strip()
        if transcript == "":
            return {
                "evaluation": None,
                "next_question": "I couldn't hear that clearly. Could you repeat?"
            }

        text_em = text_emotion(transcript)
        camera_metrics = json.loads(metrics) if metrics else {}

        add_message(
            session_id=session_id,
            role="candidate",
            text=transcript,
            text_emotion=text_em,
            camera_metrics=camera_metrics
        )

        result = evaluate_answer(
            answer=transcript,
            skill=session["skill"],
            project=session.get("project"),
            github_summary=session["github_context"],
            camera_metrics=camera_metrics,
            text_emotion=text_em
        )

        next_q = result.get("next_question") or \
            "Thanks. Can you explain that in more detail?"

        add_message(
            session_id=session_id,
            role="interviewer",
            text=next_q
        )

        return {
            "evaluation": result,
            "next_question": next_q
        }

    except HTTPException:
        raise
    except Exception:
        traceback.print_exc()
        raise HTTPException(500, "Answer processing failed")
