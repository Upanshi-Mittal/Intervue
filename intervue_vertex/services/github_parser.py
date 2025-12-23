import os
import requests
from collections import defaultdict

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Accept": "application/vnd.github+json"
}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_TOKEN}"


IMPORTANT_SKILLS = [
    "react", "next", "node", "express", "mongodb",
    "firebase", "tailwind", "redux", "typescript",
    "django", "flask", "fastapi", "three", "gsap",
    "vite", "webpack"
]

SKILL_WEIGHT = {
    "react": 5,
    "next": 5,
    "node": 5,
    "express": 5,
    "django": 5,
    "flask": 5,
    "fastapi": 5,
    "mongodb": 3,
    "firebase": 3,
    "redux": 3,
    "typescript": 3,
    "vite": 3,
    "webpack": 3,
    "tailwind": 3,
    "three": 3,
    "gsap": 2,
    "python": 1,
    "javascript": 1,
    "html": 1,
    "css": 1,
    "pyTorch": 2,
    "tensorflow": 2,
    "docker": 2,
    "kubernetes": 2
}


def fetch_github_profile(username: str):
    repos_url = f"https://api.github.com/users/{username}/repos?per_page=100"
    res = requests.get(repos_url, headers=HEADERS)

    if res.status_code != 200:
        return {"error": "Invalid GitHub username or API rate limit exceeded"}

    repos = res.json()

    skill_scores = defaultdict(int)
    language_count = defaultdict(int)
    projects = []

    for repo in repos:
        # ignore forks
        if repo.get("fork"):
            continue

        name = repo["name"]
        description = (repo.get("description") or "").lower()
        language = repo.get("language")
        stars = repo.get("stargazers_count", 0)
        updated_at = repo.get("updated_at")

        # ---------- LANGUAGE SIGNAL ----------
        if language:
            language_count[language] += 1
            lang = language.lower()
            if lang in IMPORTANT_SKILLS:
                skill_scores[lang] += SKILL_WEIGHT.get(lang, 1)

        # ---------- DESCRIPTION SIGNAL ----------
        for skill in IMPORTANT_SKILLS:
            if skill in description:
                skill_scores[skill] += SKILL_WEIGHT.get(skill, 1)

        # ---------- TOPICS SIGNAL ----------
        for topic in repo.get("topics", []):
            topic = topic.lower()
            if topic in IMPORTANT_SKILLS:
                skill_scores[topic] += SKILL_WEIGHT.get(topic, 1)

        # ---------- package.json (JS projects only) ----------
        for branch in ["main", "master"]:
            pkg_url = f"https://raw.githubusercontent.com/{username}/{name}/{branch}/package.json"
            pkg_res = requests.get(pkg_url, headers=HEADERS)
            if pkg_res.status_code == 200:
                try:
                    pkg = pkg_res.json()
                    deps = {
                        **pkg.get("dependencies", {}),
                        **pkg.get("devDependencies", {})
                    }
                    for dep in deps:
                        dep = dep.lower()
                        if dep in IMPORTANT_SKILLS:
                            skill_scores[dep] += SKILL_WEIGHT.get(dep, 1)
                except Exception:
                    pass
                break

        projects.append({
            "name": name,
            "language": language,
            "stars": stars,
            "last_updated": updated_at,
            "description": repo.get("description", "")
        })

    # ---------- SORT RESULTS ----------
    sorted_skills = sorted(
        skill_scores.items(),
        key=lambda x: -x[1]
    )

    dominant_languages = sorted(
        language_count,
        key=language_count.get,
        reverse=True
    )

    projects = sorted(
        projects,
        key=lambda p: (
            p["last_updated"] is None,
            -p["stars"]
        )
    )

    return {
        "username": username,
        "languages": dominant_languages[:3],
        "skills": [s[0] for s in sorted_skills[:6]],
        "skill_scores": dict(skill_scores),
        "top_projects": projects[:5]
    }
