import time

interview_sessions = {}

def start_session(username, skill, project, first_question):
    interview_sessions[username] = {
        "username": username,
        "skill": skill,
        "project": project,
        "turns": [
            {
                "question": first_question,
                "answer": None,
                "evaluation": {},
                "text_emotion": {},
                "audio_emotion": {},
                "camera_metrics": [],
                "timestamp": time.time()
            }
        ],
        "completed": False,
        "count": 0,
        "started_at": time.time(),
        "ended_at": None
    }

def update_camera_metrics(username, metrics):
    session = interview_sessions.get(username)
    if not session:
        return

    current_turn = session["turns"][-1]
    current_turn["camera_metrics"].append({
        **metrics,
        "timestamp": time.time()
    })


def update_session(
    username,
    question,
    answer,
    evaluation=None,
    text_em=None,
    audio_em=None,
):
    session = interview_sessions.get(username)
    if not session:
        return

    current_turn = session["turns"][-1]
    current_turn["answer"] = answer
    current_turn["evaluation"] = evaluation or {}
    current_turn["text_emotion"] = text_em or {}
    current_turn["audio_emotion"] = audio_em or {}
    
    session["turns"].append({
        "question": question,
        "answer": answer,
        "evaluation": evaluation or {},
        "text_emotion": text_em or {},
        "audio_emotion": audio_em or {},
        "camera_metrics": [],
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
    return session


def reset_session(username):
    interview_sessions.pop(username, None)
