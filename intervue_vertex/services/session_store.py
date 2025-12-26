# services/session_store.py

from typing import Dict, List

sessions: Dict[str, List[dict]] = {}

def get_session(session_id: str):
    return sessions.setdefault(session_id, [])

def add_turn(session_id: str, role: str, content: str):
    sessions.setdefault(session_id, []).append({
        "role": role,
        "content": content
    })
