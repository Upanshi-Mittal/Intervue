"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Interviewer() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = Math.sin(t / 2) * 0.2;
    mesh.current.position.y = Math.sin(t) * 0.05;
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <capsuleGeometry args={[0.5, 1.2, 8, 16]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  );
}
