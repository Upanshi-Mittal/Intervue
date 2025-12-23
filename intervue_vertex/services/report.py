# services/report.py
import statistics
import time
import io
import base64
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def _aggregate_emotions(turns):
    text_ems = [t.get("text_emotion", {}) for t in turns if t.get("text_emotion")]
    audio_ems = [t.get("audio_emotion", {}) for t in turns if t.get("audio_emotion")]

    def dominant(items):
        emos = [i.get("emotion") for i in items if i.get("emotion")]
        return max(set(emos), key=emos.count) if emos else "neutral"

    return {
        "dominant_text_emotion": dominant(text_ems),
        "dominant_audio_emotion": dominant(audio_ems),
        "text_scores": [i.get("score", 0) for i in text_ems],
        "audio_scores": [i.get("score", 0) for i in audio_ems],
    }


def compute_confidence(camera_metrics, audio_em, text_em):
    camera_metrics = camera_metrics or {}
    audio_em = audio_em or {}
    text_em = text_em or {}

    eye = camera_metrics.get("eye_contact", 0)
    still = camera_metrics.get("stillness", 0)
    smile = (
        camera_metrics.get("expression_score", 0)
        if camera_metrics.get("dominant_expression") == "happy"
        else 0
    )
    distraction = camera_metrics.get("distraction", 0)

    visual = max(0, (0.5 * eye + 0.3 * still + 0.2 * smile) * (1 - distraction))
    vocal = audio_em.get("score", 0)

    text_map = {"happy": 1.0, "neutral": 0.6, "concerned": 0.3}
    textual = text_map.get(text_em.get("emotion"), 0.6)

    return round(0.5 * visual + 0.35 * vocal + 0.15 * textual, 2)


def make_report(session):
    report = {
        "username": session.get("username"),
        "skill": session.get("skill"),
        "project": session.get("project"),
        "started_at": session.get("started_at"),
        "ended_at": session.get("ended_at"),
        "total_turns": session.get("count"),
        "turns": session.get("turns", []),
    }

    agg = _aggregate_emotions(report["turns"])
    report["emotion_summary"] = agg

    # 📊 Score aggregation (Gemini-compatible)
    scores = []
    for t in report["turns"]:
        ev = t.get("evaluation", {})
        sc = ev.get("score")
        if isinstance(sc, (int, float)):
            scores.append(sc / 10)  # normalize 0–1

    report["avg_score"] = round(statistics.mean(scores), 2) if scores else None

    # 🧠 Confidence score (avg of turns)
    confidences = []
    for t in report["turns"]:
        confidences.append(
            compute_confidence(
                t.get("camera_metrics"),
                t.get("audio_emotion"),
                t.get("text_emotion"),
            )
        )

    report["confidence_score"] = (
        round(statistics.mean(confidences), 2) if confidences else None
    )

    # 📝 Summary
    if report["avg_score"] is not None:
        if report["avg_score"] >= 0.75:
            summary = "Candidate performed very well across the interview."
        elif report["avg_score"] >= 0.5:
            summary = "Candidate showed decent performance with room for improvement."
        else:
            summary = "Candidate needs significant improvement in technical depth or communication."
    else:
        summary = "Insufficient data to evaluate candidate performance."

    summary += (
        f" Dominant text emotion: {agg['dominant_text_emotion']}."
        f" Dominant audio emotion: {agg['dominant_audio_emotion']}."
    )

    report["summary"] = summary

    # 📄 PDF generation (base64)
    try:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        w, h = A4
        y = h - 50

        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, f"Interview Report – {report['username']}")
        y -= 30

        c.setFont("Helvetica", 10)
        c.drawString(50, y, f"Skill: {report['skill']} | Project: {report['project']}")
        y -= 20
        c.drawString(50, y, f"Started: {time.ctime(report['started_at'])}")
        y -= 20
        c.drawString(50, y, f"Ended: {time.ctime(report['ended_at'])}")
        y -= 30

        c.drawString(50, y, "Summary:")
        y -= 15
        for line in report["summary"].split(". "):
            c.drawString(60, y, line.strip())
            y -= 14

        y -= 10
        c.drawString(50, y, "Interview Turns:")
        y -= 18

        for t in report["turns"]:
            q = (t.get("question") or "")[:90]
            a = (t.get("answer") or "")[:120]
            sc = t.get("evaluation", {}).get("score", "N/A")
            c.drawString(60, y, f"Q: {q}")
            y -= 12
            c.drawString(60, y, f"A: {a}")
            y -= 12
            c.drawString(60, y, f"Score: {sc}")
            y -= 18
            if y < 80:
                c.showPage()
                y = h - 50

        c.save()
        buffer.seek(0)
        report["pdf_base64"] = base64.b64encode(buffer.read()).decode("utf-8")

    except Exception as e:
        report["pdf_error"] = str(e)

    return report
