"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import Interviewer from "./_components/Interviewer";

export default function InterviewPage() {
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

      <motion.div
        initial={{ y: 90, opacity: 0 }}
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
