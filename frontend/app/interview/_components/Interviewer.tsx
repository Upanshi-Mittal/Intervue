"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type InterviewerControls = {
  setMouthOpen: (v: number) => void;
  setExpression: (name: "confident" | "neutral" | "nervous") => void;
};

const Interviewer = forwardRef<InterviewerControls>((_, ref) => {
  const group = useRef<THREE.Group>(null);

  const mouthMesh = useRef<THREE.SkinnedMesh | null>(null);
  const mouthIndex = useRef<number>(-1);

  const blink = useRef<{
    mesh: THREE.SkinnedMesh;
    left: number;
    right: number;
    timer: number;
    duration: number;
  } | null>(null);

  const { scene } = useGLTF(
    "https://models.readyplayer.me/693eb2fd78f65986cce8f137.glb?morphTargets=ARKit"
  );

  // Locate morph targets
  useEffect(() => {
    scene.traverse((obj) => {
      if (
        obj instanceof THREE.SkinnedMesh &&
        obj.morphTargetDictionary &&
        obj.morphTargetInfluences
      ) {
        const dict = obj.morphTargetDictionary;

        // Mouth (lip sync)
        if (dict.jawOpen !== undefined) {
          mouthMesh.current = obj;
          mouthIndex.current = dict.jawOpen;
        }

        // Eye blink
        if (
          dict.eyeBlinkLeft !== undefined &&
          dict.eyeBlinkRight !== undefined
        ) {
          blink.current = {
            mesh: obj,
            left: dict.eyeBlinkLeft,
            right: dict.eyeBlinkRight,
            timer: Math.random() * 4 + 2,
            duration: 0,
          };
        }
      }
    });
  }, [scene]);

  // Expose controls to parent
  useImperativeHandle(ref, () => ({
    setMouthOpen(v: number) {
      if (mouthMesh.current && mouthIndex.current !== -1) {
        mouthMesh.current.morphTargetInfluences![mouthIndex.current] = v;
      }
    },
    setExpression(_) {
      // (future: smile, brows, etc.)
    },
  }));

  // Idle motion + blinking
  useFrame((state, delta) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();
    group.current.position.y = -2.2 + Math.sin(t * 1.1) * 0.015;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.02;

    if (blink.current) {
      blink.current.timer -= delta;

      if (blink.current.timer <= 0) {
        blink.current.duration += delta * 10;
        const v = Math.sin(Math.min(blink.current.duration, Math.PI));

        blink.current.mesh.morphTargetInfluences![blink.current.left] = v;
        blink.current.mesh.morphTargetInfluences![blink.current.right] = v;

        if (blink.current.duration >= Math.PI) {
          blink.current.duration = 0;
          blink.current.timer = Math.random() * 4 + 2;
          blink.current.mesh.morphTargetInfluences![blink.current.left] = 0;
          blink.current.mesh.morphTargetInfluences![blink.current.right] = 0;
        }
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.2} />
    </group>
  );
});

export default Interviewer;
