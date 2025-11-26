import requests

IMPORTANT_SKILLS = [
    "react", "next", "gsap", "three", "node",
    "express", "mongodb", "firebase", "tailwind",
    "redux", "typescript", "vite", "webpack",
    "django", "flask", "fastapi"
]

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

        # ✅ Language tracking
        if lang:
            languages[lang] = languages.get(lang, 0) + 1

        # ✅ Detect last commit
        commits_url = f"https://api.github.com/repos/{username}/{name}/commits"
        commits_response = requests.get(commits_url)

        last_commit = None

        if commits_response.status_code == 200:
            commits = commits_response.json()
            if len(commits) > 0:
                last_commit = commits[0]["commit"]["author"]["date"]

                # ✅ commit skill detection
                msg = commits[0]["commit"]["message"].lower()
                for skill in IMPORTANT_SKILLS:
                    if skill in msg:
                        detected_skills.add(skill)

        # ✅ package.json detection
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

        # ✅ topic detection
        for t in repo.get("topics", []):
            if t.lower() in IMPORTANT_SKILLS:
                detected_skills.add(t.lower())

        # ✅ ADD FULL PROJECT OBJECT
        projects.append({
            "name": name,
            "stars": stars,
            "last_commit": last_commit,
            "description": desc
        })

    # ✅ Sort projects
    projects = sorted(
        projects,
        key=lambda x: (
            -x["stars"],                    # most stars first
            x["last_commit"] is None,       # push no-commit projects down
            x["last_commit"]                # newest first
        )
    )

    # ✅ sort languages by usage
    dominant_languages = sorted(languages, key=languages.get, reverse=True)

    return {
        "languages": dominant_languages[:3],
        "skills": list(detected_skills),
        "top_projects": projects[:5]
    }
