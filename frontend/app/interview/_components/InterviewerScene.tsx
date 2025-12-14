"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Interviewer from "./Interviewer";

export default function InterviewerScene() {
  return (
    <Canvas
  camera={{ position: [0.25, 1.65, 1.2], fov: 28 }}
  onCreated={({ camera }) => {
    camera.lookAt(0, 1.6, 0);
  }}
>

      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 2, 2]} intensity={1.2} />
      <Environment preset="night" />
      <Interviewer />
    </Canvas>
  );
}
