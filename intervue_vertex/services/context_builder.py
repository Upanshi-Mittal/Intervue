def build_candidate_context(profile: dict) -> str:
    languages = ", ".join(profile.get("languages", []))
    skills = ", ".join(profile.get("skills", []))

    projects = profile.get("top_projects", [])
    projects_txt = "\n".join(
        f"- {p['name']} (⭐ {p['stars']})"
        for p in projects[:3]
    )

    return f"""
Candidate GitHub Profile

Languages:
{languages}

Key Skills:
{skills}

Top Projects:
{projects_txt}

Interview Rules:
- Base questions strictly on candidate projects
- Ask WHY and HOW, not WHAT
- Increase difficulty gradually
- Be professional but human
""".strip()
