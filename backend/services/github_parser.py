import requests

IMPORTANT_SKILLS = [
    "react", "next", "gsap", "three", "node",
    "express", "mongodb", "firebase", "tailwind",
    "redux", "typescript", "vite", "webpack",
    "django", "flask", "fastapi"
]

SKILL_WEIGHT = {
    "react": 5,
    "next": 5,
    "node": 5,
    "express": 5,
    "django": 5,
    "flask": 5,
    "fastapi": 5,
    "three": 3,
    "mongodb": 3,
    "firebase": 3,
    "redux": 3,
    "typescript": 3,
    "vite": 3,
    "webpack": 3,
    "tailwind": 3,
    "gsap": 2
}

def fetch_github_profile(username):
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "Invalid GitHub username or rate limit exceeded"}

    repos = response.json()

    languages = {}
    detected_skills = set()
    projects = []

    for repo in repos:
        name = repo["name"]
        lang = repo["language"]
        stars = repo["stargazers_count"]
        desc = repo["description"] or "No description available"

        if lang:
            languages[lang] = languages.get(lang, 0) + 1

        commits_url = f"https://api.github.com/repos/{username}/{name}/commits"
        commits_response = requests.get(commits_url)

        last_commit = None

        if commits_response.status_code == 200:
            commits = commits_response.json()
            if len(commits) > 0:
                last_commit = commits[0]["commit"]["author"]["date"]

                msg = commits[0]["commit"]["message"].lower()
                for skill in IMPORTANT_SKILLS:
                    if skill in msg:
                        detected_skills.add(skill)

        package_url = f"https://raw.githubusercontent.com/{username}/{name}/main/package.json"
        package_response = requests.get(package_url)

        if package_response.status_code == 200:
            try:
                package_json = package_response.json()
                deps = package_json.get("dependencies", {})
                dev_deps = package_json.get("devDependencies", {})
                all_deps = {**deps, **dev_deps}

                for dep in all_deps.keys():
                    dep = dep.lower()
                    if dep in IMPORTANT_SKILLS:
                        detected_skills.add(dep)

            except:
                pass

        for t in repo.get("topics", []):
            if t.lower() in IMPORTANT_SKILLS:
                detected_skills.add(t.lower())

        projects.append({
            "name": name,
            "stars": stars,
            "last_commit": last_commit,
            "description": desc
        })

    projects = sorted(
        projects,
        key=lambda x: (
            -x["stars"],
            x["last_commit"] is None,
            x["last_commit"]
        )
    )

    skill_scores = {
        skill: SKILL_WEIGHT.get(skill, 1)
        for skill in detected_skills
    }

    sorted_skills = sorted(
        skill_scores.items(),
        key=lambda x: -x[1]
    )

    dominant_languages = sorted(
        languages,
        key=languages.get,
        reverse=True
    )

    return {
        "languages": dominant_languages[:3],
        "skills": [s[0] for s in sorted_skills],
        "skill_scores": skill_scores,
        "top_projects": projects[:5]
    }
