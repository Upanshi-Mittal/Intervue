import time

interview_sessions = {}

def start_session(session_id, github_context, skill, project, first_message):
    interview_sessions[session_id] = {
        "github_context": github_context,
        "skill": skill,
        "project": project,
        "messages": [
            {
                "role": "interviewer",
                "text": first_message,
                "timestamp": time.time()
            }
        ],
        "count": 0,
        "started_at": time.time()
    }

def add_message(
    session_id,
    role,
    text,
    text_emotion=None,
    audio_emotion=None,
    camera_metrics=None
):
    session = interview_sessions.get(session_id)
    if not session:
        return

    session["messages"].append({
        "role": role,
        "text": text,
        "text_emotion": text_emotion or {},
        "audio_emotion": audio_emotion or {},
        "camera_metrics": camera_metrics or {},
        "timestamp": time.time()
    })

    if role == "candidate":
        session["count"] += 1

def get_session(session_id):
    return interview_sessions.get(session_id)

def end_session(session_id):
    session = interview_sessions.get(session_id)
    if session:
        session["completed"] = True
        session["ended_at"] = time.time()
