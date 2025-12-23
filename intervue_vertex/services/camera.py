import cv2
import numpy as np
import os
from fastapi import UploadFile

CAMERA_DIR = "camera_frames"

# Load Haar cascades
FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
EYE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_eye.xml"
)

async def analyze_camera_frame(frame: UploadFile):
    data = await frame.read()

    np_img = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Invalid image"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return {
            "eye_contact": 0.0,
            "stillness": 0.0,
            "expression_score": 0.3,
            "distraction": 1.0
        }

    (x, y, w, h) = faces[0]
    face_roi = gray[y:y+h, x:x+w]

    eyes = EYE_CASCADE.detectMultiScale(face_roi)

    # 🎯 Metrics
    eye_contact = 1.0 if len(eyes) >= 1 else 0.3
    stillness = 0.8   # (phase 2: motion tracking)
    distraction = 0.0 if len(eyes) >= 1 else 0.5

    metrics = {
        "eye_contact": round(eye_contact, 2),
        "stillness": round(stillness, 2),
        "distraction": round(distraction, 2)
    }
    print("STATE:", metrics)


    return metrics
