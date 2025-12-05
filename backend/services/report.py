# services/report.py
import json
import statistics
import time
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io
import base64

def _aggregate_emotions(turns):
    text_emotions = [t.get("text_em", {}) for t in turns]
    audio_emotions = [t.get("audio_em", {}) for t in turns if t.get("audio_em")]

    # simple counts
    def mode_or_none(items, key="emotion"):
        vals = [it.get(key) for it in items if it.get(key)]
        return max(set(vals), key=vals.count) if vals else None

    return {
        "dominant_text_emotion": mode_or_none(text_emotions),
        "dominant_audio_emotion": mode_or_none(audio_emotions),
        "text_scores": [it.get("score", 0.0) for it in text_emotions],
        "audio_scores": [it.get("score", 0.0) for it in audio_emotions]
    }

def make_report(session):
    """
    Returns a JSON-friendly report and also a base64 PDF string (optional)
    """
    report = {}
    report["username"] = session.get("username")
    report["skill"] = session.get("skill")
    report["project"] = session.get("project")
    report["started_at"] = session.get("started_at")
    report["ended_at"] = session.get("ended_at")
    report["total_turns"] = session.get("count")
    report["turns"] = session.get("turns")

    agg = _aggregate_emotions(session.get("turns", []))
    report["emotion_summary"] = agg

    scores = []
    for t in session.get("turns", []):
        ev = t.get("evaluation", {})
        if isinstance(ev, dict):
            perf = ev.get("performance")
            if perf == "good":
                scores.append(0.9)
            elif perf == "average":
                scores.append(0.6)
            elif perf == "weak":
                scores.append(0.3)
            elif ev.get("score") is not None:
                try:
                    scores.append(float(ev.get("score")))
                except:
                    pass

    report["avg_score"] = statistics.mean(scores) if scores else None

    # textual summary (heuristic)
    dom_text = agg.get("dominant_text_emotion") or "neutral"
    dom_audio = agg.get("dominant_audio_emotion") or "neutral"
    avg_score = report.get("avg_score")
    if avg_score is not None:
        if avg_score >= 0.75:
            summary = "Candidate performed very well across the interview."
        elif avg_score >= 0.5:
            summary = "Candidate showed decent performance with room for improvement."
        else:
            summary = "Candidate needs significant improvements in technical depth or communication."
    else:
        summary = "Not enough evaluation score data to provide an automated summary."

    summary += f" Dominant text emotion: {dom_text}. Dominant audio emotion: {dom_audio}."
    report["summary"] = summary

    # Generate PDF (base64) - optional
    try:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        w, h = A4
        y = h - 50
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, f"Interview Report - {report['username']}")
        y -= 30
        c.setFont("Helvetica", 10)
        c.drawString(50, y, f"Skill: {report['skill']}  |  Project: {report['project']}")
        y -= 20
        c.drawString(50, y, f"Started: {time.ctime(report['started_at']) if report['started_at'] else 'N/A'}")
        y -= 20
        c.drawString(50, y, f"Ended: {time.ctime(report['ended_at']) if report['ended_at'] else 'N/A'}")
        y -= 30
        c.drawString(50, y, "Summary:")
        y -= 18
        text_lines = report["summary"].split(". ")
        for ln in text_lines:
            c.drawString(60, y, ln.strip())
            y -= 14
            if y < 60:
                c.showPage()
                y = h - 50
        y -= 10
        c.drawString(50, y, "Per-turn details:")
        y -= 18
        for t in report["turns"]:
            q = (t.get("question") or "")[:80].replace("\n", " ")
            a = (t.get("answer") or "")[:120].replace("\n", " ")
            ev = t.get("evaluation", {}).get("performance", "")
            c.drawString(60, y, f"Q: {q}")
            y -= 12
            c.drawString(60, y, f"A: {a}")
            y -= 12
            c.drawString(60, y, f"Eval: {ev}")
            y -= 18
            if y < 80:
                c.showPage()
                y = h - 50
        c.save()
        buffer.seek(0)
        pdf_bytes = buffer.read()
        report["pdf_base64"] = base64.b64encode(pdf_bytes).decode("utf-8")
    except Exception as e:
        report["pdf_error"] = str(e)

def compute_confidence(camera_metrics, audio_em, text_em):
    eye = camera_metrics.get("eye_contact", 0)
    still = camera_metrics.get("stillness", 0)
    smile = camera_metrics.get("expression_score", 0) if camera_metrics.get("dominant_expression") == "happy" else 0
    distraction = camera_metrics.get("distraction", 0)
    visual = max(0, (0.5*eye + 0.3*still + 0.2*smile) * (1 - distraction))
    vocal = (audio_em.get("score", 0) if audio_em else 0)
    text_map = {"happy": 1.0, "neutral": 0.6, "concerned": 0.3}
    txt = text_map.get(text_em.get("emotion"), 0.6)
    confidence = 0.5 * visual + 0.35 * vocal + 0.15 * txt
    return float(confidence)

    return report
