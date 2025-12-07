"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import Interviewer from "./_components/Interviewer";

export default function InterviewPage() {
  return (
    <div className="relative h-screen w-full bg-black">
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={1} />
        <Environment preset="studio" />
        <Interviewer />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Bottom Dock (Google Meet Style) */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-xl border border-white/20 shadow-lg">
          <button className="px-6 py-2 rounded-full bg-white text-black text-sm tracking-wide hover:bg-white/80 transition">
            Start
          </button>
          <button className="px-6 py-2 rounded-full bg-red-500 text-white text-sm tracking-wide hover:bg-red-600 transition">
            End
          </button>
        </div>
      </motion.div>
    </div>
  );
}
