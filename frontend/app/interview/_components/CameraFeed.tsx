"use client";

import { useEffect } from "react";
import React from "react";

type CameraFeedProps = {
  active: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
};

export async function captureFrame(
  video: HTMLVideoElement
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7)
  );
}

export async function sendFrame(frame: Blob) {
  const formData = new FormData();
  formData.append("frame", frame);

  await fetch("http://localhost:8000/camera/analyze", {
    method: "POST",
    body: formData,
  });

  console.warn("Camera frame skipped");
}

export default function CameraFeed({ active, videoRef }: CameraFeedProps) {
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      if (!active) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [active, videoRef]);

  if (!active) return null;

  return (
    <div className="absolute top-24 right-6 z-50 rounded-xl overflow-hidden border border-white/20 bg-black shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-40 sm:w-56 aspect-video object-cover"
      />
    </div>
  );
}
