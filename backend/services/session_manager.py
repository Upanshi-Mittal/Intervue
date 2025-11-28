import time
interview_sessions = {}

def start_session(username, skill, project):
    interview_sessions[username] = {
        "username": username,
        "skill": skill,
        "project": project,
        "turns": [],   
        "completed": False,
        "count": 0,
        "started_at": time.time(),
        "ended_at": None
    }

def update_session(username, question, answer, evaluation=None, text_em=None, audio_em=None):
    session = interview_sessions.get(username)
    if session:
        session["turns"].append({
            "question": question,
            "answer": answer,
            "evaluation": evaluation or {},
            "text_emotion": text_em or {},
            "audio_emotion": audio_em or {},
            "timestamp": time.time()
        })
        session["count"] += 1

def get_session(username):
    return interview_sessions.get(username)

def end_session(username):
    session = interview_sessions.get(username)
    if session:
        session["completed"] = True
        session["ended_at"] = time.time()

def reset_session(username):
    if username in interview_sessions:
        del interview_sessions[username]
