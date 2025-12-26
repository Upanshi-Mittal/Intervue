import time

interview_sessions = {}

sessions = {}

def start_session(session_id, github_context, skill, project, first_message):
    interview_sessions[session_id] = {
        "github_context": github_context,
        "skill": skill,
        "project": project,
        "messages": [
            {
                "role": "interviewer",
                "content": first_message
            }
        ]
    }


def add_message(
    username,
    role,
    text,
    text_emotion=None,
    audio_emotion=None,
    camera_metrics=None
):
    session = interview_sessions.get(username)
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

def get_session(username):
    return interview_sessions.get(username)

def end_session(username):
    session = interview_sessions.get(username)
    if session:
        session["completed"] = True
        session["ended_at"] = time.time()
