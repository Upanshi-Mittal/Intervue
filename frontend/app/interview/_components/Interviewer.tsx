"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Interviewer() {
  const group = useRef<THREE.Group>(null);

  const blink = useRef<{
    mesh: THREE.SkinnedMesh;
    left: number;
    right: number;
    timer: number;
    duration: number;
  } | null>(null);

  const { scene } = useGLTF(
    "https://models.readyplayer.me/693eb2fd78f65986cce8f137.glb" +"?morphTargets=ARKit" + "&animations=Idle"
  );
  useEffect(() => {
    scene.traverse((obj) => {
      if (
        obj instanceof THREE.SkinnedMesh &&
        obj.name === "Wolf3D_Head" &&
        obj.morphTargetDictionary &&
        obj.morphTargetInfluences
      ) {
        const dict = obj.morphTargetDictionary;

        blink.current = {
          mesh: obj,
          left: dict.eyeBlinkLeft,
          right: dict.eyeBlinkRight,
          timer: Math.random() * 4 + 2,
          duration: 0,
        };
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();

    group.current.position.y = -2.2 + Math.sin(t * 1.1) * 0.015;

    group.current.rotation.y = Math.sin(t * 0.5) * 0.02;

    if (blink.current) {
      blink.current.timer -= delta;

      if (blink.current.timer <= 0) {
        blink.current.duration += delta * 10;

        const v = Math.sin(
          Math.min(blink.current.duration, Math.PI)
        );

        blink.current.mesh.morphTargetInfluences[
          blink.current.left
        ] = v;
        blink.current.mesh.morphTargetInfluences[
          blink.current.right
        ] = v;

        if (blink.current.duration >= Math.PI) {
          blink.current.duration = 0;
          blink.current.timer = Math.random() * 4 + 2;

          blink.current.mesh.morphTargetInfluences[
            blink.current.left
          ] = 0;
          blink.current.mesh.morphTargetInfluences[
            blink.current.right
          ] = 0;
        }
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.2} />
    </group>
  );
}
