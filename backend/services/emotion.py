import io
import json
import numpy as np
import librosa
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def text_emotion(text: str):
    """
    Uses VADER sentiment to approximate emotion.
    Returns: {"emotion": "happy"|"neutral"|"concerned", "score": float}
    """
    if not text or not text.strip():
        return {"emotion": "neutral", "score": 0.0}

    s = analyzer.polarity_scores(text)
    compound = s["compound"]  

    if compound >= 0.4:
        emotion = "happy"
    elif compound <= -0.25:
        emotion = "concerned"
    else:
        emotion = "neutral"

    return {"emotion": emotion, "score": float(compound)}

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
        f0, voiced_flag, voiced_prob = librosa.pyin(y, fmin=librosa.note_to_hz('C2'),
                                                    fmax=librosa.note_to_hz('C7'))
        f0_clean = f0[~np.isnan(f0)]
        if len(f0_clean) == 0:
            return 0.0
        return float(np.median(f0_clean))
    except Exception:
        try:
            sc = librosa.feature.spectral_centroid(y=y, sr=sr)
            return float(np.median(sc))
        except:
            return 0.0

def audio_emotion(audio_bytes: bytes):
    """
    Accepts audio bytes (wav/mp3). Returns approximate emotion.
    Returns:
        {
            "emotion": "happy"|"neutral"|"concerned",
            "score": float (composite),
            "features": {rms, zcr, tempo, pitch}
        }
    """

    # load into librosa (librosa can handle mp3/wav if ffmpeg present)
    try:
        audio_file = io.BytesIO(audio_bytes)
        y, sr = librosa.load(audio_file, sr=None, mono=True)
    except Exception as e:
        # If loading fails, return neutral
        return {"emotion": "neutral", "score": 0.0, "features": {"error": str(e)}}

    rms = _rms(y)
    zcr = _zcr(y)
    tempo = _tempo(y, sr)
    pitch = _pitch_median(y, sr)

    # Normalize features heuristically (these constants are empirical)
    # NOTE: values vary a lot by recording. We scale by expected ranges.
    rms_score = min(rms / 0.05, 1.0)       # loudness normalized (0..1 typical)
    zcr_score = min(zcr / 0.1, 1.0)        # higher zcr -> more energetic (fast speech)
    tempo_score = min(tempo / 180.0, 1.0)  # tempo normalized
    pitch_score = min(pitch / 300.0, 1.0)  # pitch normalized (approximate)

    # Composite heuristic:
    # - Happy: louder, higher pitch, faster tempo
    # - Concerned: quieter, lower pitch, slower tempo, maybe negative
    composite = (0.4 * rms_score) + (0.25 * zcr_score) + (0.2 * tempo_score) + (0.15 * pitch_score)
    # map to emotion
    if composite >= 0.55:
        emotion = "happy"
    elif composite <= 0.35:
        emotion = "concerned"
    else:
        emotion = "neutral"

    features = {
        "rms": float(rms),
        "zcr": float(zcr),
        "tempo": float(tempo),
        "pitch": float(pitch),
        "rms_score": float(rms_score),
        "zcr_score": float(zcr_score),
        "tempo_score": float(tempo_score),
        "pitch_score": float(pitch_score),
        "composite": float(composite)
    }

    return {"emotion": emotion, "score": float(composite), "features": features}
