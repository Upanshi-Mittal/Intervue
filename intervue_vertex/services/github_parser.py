import os
import requests
from collections import defaultdict

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Accept": "application/vnd.github.mercy-preview+json"
}

if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"

IMPORTANT_SKILLS = [
    "react", "next", "node", "express", "mongodb",
    "firebase", "tailwind", "redux", "typescript",
    "django", "flask", "fastapi", "three", "gsap",
]

def fetch_github_profile(username: str):
    try:
        url = f"https://api.github.com/users/{username}/repos?per_page=100"
        res = requests.get(url, headers=HEADERS, timeout=10)

        if res.status_code != 200:
            return None

        repos = res.json()

        skills = defaultdict(int)
        languages = defaultdict(int)

        for repo in repos:
            if repo.get("fork"):
                continue

            lang = repo.get("language")
            desc = (repo.get("description") or "").lower()

            if lang:
                languages[lang.lower()] += 1

            for s in IMPORTANT_SKILLS:
                if s in desc:
                    skills[s] += 1

        return {
            "languages": sorted(languages, key=languages.get, reverse=True)[:3],
            "skills": sorted(skills, key=skills.get, reverse=True)[:5]
        }

    except Exception:
        return None
