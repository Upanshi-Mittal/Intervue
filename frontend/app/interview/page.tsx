"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

import Interviewer from "./_components/Interviewer";
import CameraFeed, { sendFrame, captureFrame } from "./_components/CameraFeed";

async function speak(text: string) {
  const formData = new FormData();
  formData.append("text", text);

  const res = await fetch("http://localhost:8000/speak", {
    method: "POST",
    body: formData,
  });

  const audioBlob = await res.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

export default function InterviewPage() {
  // ───────────────── STATE ─────────────────
  const [cameraOn, setCameraOn] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // ───────────────── REFS ─────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ───────────────── INTERVIEW START ─────────────────
  const startInterview = useCallback(async () => {
    const username = "Upanshi-Mittal";
    
    try {
      const res = await fetch(`http://localhost:8000/start-interview/${username}`);
      const data = await res.json();
      
      setSessionId(data.session_id);
      setQuestion(data.question);
      setCameraOn(true);
      setInterviewStarted(true);
      speak(data.question); // AI interviewer speaks question
    } catch (err) {
      console.error("Failed to start interview", err);
    }
  }, []);

  // ───────────────── AUDIO RECORDING ─────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !sessionId || !recording) return;

    mediaRecorderRef.current.stop();
    setRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      
      // Stop all tracks
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

      const formData = new FormData();
      formData.append("username", sessionId);
      formData.append("file", audioBlob, "answer.webm");

      try {
        const res = await fetch("http://localhost:8000/answer", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.next_question) {
          setQuestion(data.next_question);
          speak(data.next_question); // AI speaks next question
        }
      } catch (err) {
        console.error("Failed to submit answer", err);
      }
    };
  }, [sessionId, recording]);

  // ───────────────── CAMERA FRAME SENDING ─────────────────
  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled || !videoRef.current) return;
      if (videoRef.current.readyState < 2) return;
      if (document.hidden) return;

      const frame = await captureFrame(videoRef.current);
      if (frame) await sendFrame(frame);
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [cameraOn]);

  // ───────────────── MAIN BUTTON HANDLERS ─────────────────
  const handleStartInterview = () => {
    startInterview();
    startRecording(); // Start recording immediately after interview starts
  };

  const handleEndInterview = () => {
    if (recording) {
      stopRecording();
    }
    setCameraOn(false);
    setQuestion(null);
    setSessionId(null);
    setInterviewStarted(false);
    setRecording(false);
  };

  return (
    <div className="relative h-screen w-full bg-black">
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[1.5, 2, 2]} intensity={1.3} />
        <directionalLight position={[-1.2, 1.5, 1.8]} intensity={0.4} />
        <directionalLight position={[0, 2, -2]} intensity={0.6} />
        <Environment preset="studio" />
        <Interviewer />
      </Canvas>

      {/* Question Display */}
      {question && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 max-w-xl text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 text-white"
          >
            {question}
          </motion.div>
        </div>
      )}

      {/* Camera Feed */}
      <CameraFeed active={cameraOn} videoRef={videoRef} />

      {/* Controls */}
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-xl border border-white/20 shadow-lg">
          
          {!interviewStarted ? (
            <button
              onClick={handleStartInterview}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white text-sm font-medium hover:from-emerald-500 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
            >
              🎤 Start Interview
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-white/80">
                <div className={`w-3 h-3 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-sm">{recording ? 'Recording...' : 'Ready'}</span>
              </div>
              
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  recording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {recording ? '⏹️ Stop Answer' : '🎙️ Start Answer'}
              </button>
            </>
          )}

          <button
            onClick={handleEndInterview}
            className="px-6 py-2 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 shadow-lg hover:shadow-xl transition-all"
          >
            End Interview
          </button>
        </div>
      </motion.div>
    </div>
  );
}
