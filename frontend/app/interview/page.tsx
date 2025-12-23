"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, Phone, Settings, MoreVertical, User } from "lucide-react";
import * as THREE from "three";
import Interviewer from "./_components/Interviewer";
// 3D Interviewer Avatar Component
// function InterviewerAvatar() {
//   const meshRef = useRef<THREE.Group>(null);
//   const [speaking, setSpeaking] = useState(false);

//   // Animate the avatar
//   useFrame((state) => {
//     if (!meshRef.current) return;
    
//     // Gentle floating animation
//     meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
//     // Subtle rotation
//     meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
//   });

//   // Simulate speaking animation
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setSpeaking(prev => !prev);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <group ref={meshRef} position={[0, 0, 0]}>
//       {/* Head */}
//       <mesh position={[0, 0.5, 0]} castShadow>
//         <sphereGeometry args={[0.4, 32, 32]} />
//         <meshStandardMaterial 
//           color="#8b5cf6" 
//           roughness={0.3}
//           metalness={0.2}
//         />
//       </mesh>
      
//       {/* Body */}
//       <mesh position={[0, -0.2, 0]} castShadow>
//         <capsuleGeometry args={[0.35, 0.8, 16, 32]} />
//         <meshStandardMaterial 
//           color="#6366f1" 
//           roughness={0.4}
//           metalness={0.1}
//         />
//       </mesh>
      
//       {/* Eyes */}
//       <mesh position={[-0.15, 0.55, 0.3]}>
//         <sphereGeometry args={[0.05, 16, 16]} />
//         <meshStandardMaterial color="#ffffff" />
//       </mesh>
//       <mesh position={[0.15, 0.55, 0.3]}>
//         <sphereGeometry args={[0.05, 16, 16]} />
//         <meshStandardMaterial color="#ffffff" />
//       </mesh>
      
//       {/* Pupils */}
//       <mesh position={[-0.15, 0.55, 0.35]}>
//         <sphereGeometry args={[0.025, 16, 16]} />
//         <meshStandardMaterial color="#1f2937" />
//       </mesh>
//       <mesh position={[0.15, 0.55, 0.35]}>
//         <sphereGeometry args={[0.025, 16, 16]} />
//         <meshStandardMaterial color="#1f2937" />
//       </mesh>
      
//       {/* Mouth - animated when speaking */}
//       <mesh 
//         position={[0, 0.4, 0.35]} 
//         scale={speaking ? [1.2, 0.8, 1] : [1, 1, 1]}
//       >
//         <sphereGeometry args={[0.08, 16, 16, 0, Math.PI]} />
//         <meshStandardMaterial color="#ef4444" />
//       </mesh>
      
//       {/* Arms */}
//       <mesh position={[-0.5, -0.2, 0]} rotation={[0, 0, 0.3]} castShadow>
//         <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
//         <meshStandardMaterial color="#6366f1" />
//       </mesh>
//       <mesh position={[0.5, -0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
//         <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
//         <meshStandardMaterial color="#6366f1" />
//       </mesh>
      
//       {/* Glow effect */}
//       <pointLight position={[0, 0.5, 0.5]} intensity={0.5} color="#8b5cf6" />
//     </group>
//   );
// }

// Camera Feed Component
function CameraFeed({ active, videoRef }: { active: boolean; videoRef: React.RefObject<HTMLVideoElement> }) {
  useEffect(() => {
    if (active && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Camera error:", err));
    }
    
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [active, videoRef]);

  return null;
}

async function speak(text: string) {
  console.log("Speaking:", text);
}

export default function InterviewPage() {
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [question, setQuestion] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Timer for call duration
  useEffect(() => {
    if (!interviewStarted) return;
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = useCallback(async () => {
    setSessionId("demo-session");
    setQuestion("Tell me about yourself and your experience.");
    setCameraOn(true);
    setInterviewStarted(true);
    speak("Tell me about yourself and your experience.");
  }, []);

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
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      
      // Simulate next question
      setTimeout(() => {
        const nextQ = "What are your greatest strengths?";
        setQuestion(nextQ);
        speak(nextQ);
      }, 1000);
    };
  }, [sessionId, recording]);

  const handleStartInterview = () => {
    startInterview();
    startRecording();
  };

  const handleEndInterview = () => {
    if (recording) stopRecording();
    setCameraOn(false);
    setQuestion(null);
    setSessionId(null);
    setInterviewStarted(false);
    setRecording(false);
    setCallDuration(0);
  };

  const toggleMic = () => setMicOn(!micOn);
  const toggleCamera = () => setCameraOn(!cameraOn);

  return (
    <div className="relative h-screen w-full bg-gray-900 overflow-hidden">
      {/* Main Video Grid */}
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2">
        
        {/* Interviewer Video (3D Avatar) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        >
          <Canvas 
            camera={{ position: [0, -0.5, 3], fov: 20 }}
            shadows
          >
            <color attach="background" args={['#1f2937']} />
            <fog attach="fog" args={['#1f2937', 5, 15]} />
            
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={1} 
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.6} penumbra={1} castShadow />
            
            <Interviewer />
            
            <Environment preset="city" />
            
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <meshStandardMaterial color="#111827" roughness={0.8} />
            </mesh>
          </Canvas>
          
          {/* Interviewer Name Tag */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2">
            <User className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">AI Interviewer</span>
            {recording && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs">Speaking</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Your Video Feed */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <p className="text-gray-400 text-sm">Camera is off</p>
              </div>
            </div>
          )}
          
          {/* Your Name Tag */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2">
            <User className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">You</span>
            {!micOn && <MicOff className="w-4 h-4 text-red-400" />}
          </div>
        </motion.div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-lg px-4 py-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{formatDuration(callDuration)}</span>
          </div>
          
          {interviewStarted && (
            <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2">
              <span className="text-white text-sm">Technical Interview</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all"
        >
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Question Banner */}
      <AnimatePresence>
        {question && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4"
          >
            <div className="bg-indigo-600/20  backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-indigo-400/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2">Current Question</h3>
                  <p className="text-white text-base leading-relaxed">{question}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black/60 to-transparent">
        <div className="max-w-4xl mx-auto">
          
          {!interviewStarted ? (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-center"
            >
              <button
                onClick={handleStartInterview}
                className="px-12 py-4 rounded-full bg-gradient-to-r from-indigo-600/70 to-blue-400 text-white text-lg font-semibold hover:from-indigo-900 hover:to-purple-900 shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:scale-105"
              >
                Start Interview
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-center gap-4"
            >
              {/* Mic Toggle */}
              <button
                onClick={toggleMic}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  micOn 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {micOn ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleCamera}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  cameraOn 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {cameraOn ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Recording Toggle */}
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`px-8 py-4 rounded-full text-white font-semibold transition-all shadow-lg ${
                  recording 
                    ? 'bg-blue-600/50 hover:bg-blue-500 animate-pulse' 
                    : 'bg-green-500/70 hover:bg-green-500'
                }`}
              >
                {recording ? '⏹️ Stop Answer' : '🎙️ Start Answer'}
              </button>

              {/* End Call */}
              <button
                onClick={handleEndInterview}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all shadow-lg transform hover:scale-105"
              >
                <Phone className="w-6 h-6 text-white transform rotate-135" />
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all shadow-lg"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hidden video element for camera feed */}
      <CameraFeed active={cameraOn} videoRef={videoRef} />
    </div>
  );
}