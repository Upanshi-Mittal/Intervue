import io
import numpy as np
import librosa
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()


# ---------- TEXT EMOTION ----------

def text_emotion(text: str):
    """
    Uses VADER sentiment to approximate emotion.
    Returns:
      {
        "emotion": "happy" | "neutral" | "concerned",
        "score": float (0.0 – 1.0 normalized)
      }
    """
    if not text or not text.strip():
        return {"emotion": "neutral", "score": 0.5}

    s = analyzer.polarity_scores(text)
    compound = s["compound"]  # -1 .. +1

    # Normalize to 0..1
    norm_score = (compound + 1) / 2

    if compound >= 0.35:
        emotion = "happy"
    elif compound <= -0.35:
        emotion = "concerned"
    else:
        emotion = "neutral"

    return {
        "emotion": emotion,
        "score": round(float(norm_score), 2)
    }


# ---------- AUDIO HELPERS ----------

def _rms(y):
    return float(np.mean(librosa.feature.rms(y + 1e-8)))

def _zcr(y):
    return float(np.mean(librosa.feature.zero_crossing_rate(y + 1e-8)))

def _tempo(y, sr):
    try:
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
        return float(tempo[0]) if len(tempo) else 0.0
    except Exception:
        return 0.0

def _pitch_median(y, sr):
    try:
        f0, _, _ = librosa.pyin(
            y,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7")
        )
        f0_clean = f0[~np.isnan(f0)]
        return float(np.median(f0_clean)) if len(f0_clean) else 0.0
    except Exception:
        return 0.0


# ---------- AUDIO EMOTION ----------

def audio_emotion(audio_bytes: bytes):
    """
    Accepts audio bytes (wav/mp3/webm).
    Returns:
      {
        "emotion": "happy" | "neutral" | "concerned",
        "score": float (0.0 – 1.0),
        "features": {...}
      }
    """
    try:
        audio_file = io.BytesIO(audio_bytes)
        y, sr = librosa.load(audio_file, sr=None, mono=True)
    except Exception as e:
        return {
            "emotion": "neutral",
            "score": 0.5,
            "features": {"error": str(e)}
        }

    rms = _rms(y)
    zcr = _zcr(y)
    tempo = _tempo(y, sr)
    pitch = _pitch_median(y, sr)

    # Normalize (empirical ranges)
    rms_score = min(rms / 0.05, 1.0)
    zcr_score = min(zcr / 0.1, 1.0)
    tempo_score = min(tempo / 180.0, 1.0)
    pitch_score = min(pitch / 300.0, 1.0)

    # Composite (speech-appropriate weights)
    composite = (
        0.45 * rms_score +
        0.25 * zcr_score +
        0.15 * tempo_score +
        0.15 * pitch_score
    )

    if composite >= 0.6:
        emotion = "happy"
    elif composite <= 0.35:
        emotion = "concerned"
    else:
        emotion = "neutral"

    features = {
        "rms": round(rms, 5),
        "zcr": round(zcr, 5),
        "tempo": round(tempo, 2),
        "pitch": round(pitch, 2),
        "composite": round(composite, 2)
    }

    return {
        "emotion": emotion,
        "score": round(float(composite), 2),
        "features": features
    }
