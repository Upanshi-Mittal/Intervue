def build_candidate_context(data: dict) -> str:
    languages = data.get("languages", [])
    skills = data.get("skills", [])
    projects = data.get("top_projects", [])

    languages_txt = ", ".join(languages) if languages else "Not clearly identified"
    skills_txt = ", ".join(skills[:5]) if skills else "Not clearly identified"

    if projects:
        projects_txt = "\n".join(
            f"- {p.get('name', 'Unnamed Project')} (⭐ {p.get('stars', 0)})"
            for p in projects[:3]
        )
    else:
        projects_txt = "No significant public projects detected."

    return f"""
GitHub Profile Summary

Primary Languages:
{languages_txt}

Top Skills:
{skills_txt}

Top Projects:
{projects_txt}

Interview Instructions:
- Base questions strictly on the candidate’s own projects and skills.
- Ask WHY design decisions were made, not just WHAT was used.
- Probe architecture, scalability, trade-offs, and edge cases.
- Increase difficulty gradually.
- Ask concise follow-up questions when answers are shallow.
- Maintain a professional but friendly interview tone.
""".strip()
