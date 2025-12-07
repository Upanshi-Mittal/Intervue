"use client";

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { ArrowRight, Play, Globe, Cpu } from 'lucide-react';

import Link from 'next/link';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Calculate distance from mouse pointer
    float dist = distance(uv, uMouse);
    
    // Create a ripple effect based on distance and time
    // This creates that "heat haze" or "liquid" feel
    float wave = sin(dist * 20.0 - uTime * 2.0) * 0.05;
    
    // Apply distortion only near the mouse (uHover controls intensity)
    float distortion = wave * exp(-dist * 3.0) * uHover;
    
    // RGB Shift (Cinematic Chromatic Aberration)
    // We sample the texture 3 times with slight offsets to separate colors
    float r = texture2D(uTexture, uv + distortion * vec2(0.5, 1.0)).r;
    float g = texture2D(uTexture, uv + distortion).g;
    float b = texture2D(uTexture, uv + distortion * vec2(0.2, 0.5)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

// --- 3D SCENE COMPONENT ---

const LiquidBackground = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  const [hovered, setHover] = useState(false);
  
 
  const texture = useTexture("https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjBncmFpbnxlbnwwfHwwfHx8MA%3D%3D");
  
  // Uniforms: Variables passed to the shader
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uHover: { value: 0.0 }
    }),
    [texture]
  );

  // Animation Loop (Runs 60fps)
  useFrame((state) => {
    if (!meshRef.current) return;

    // Update time for the wave movement
    meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();

    // Smoothly interpolate hover intensity (Lerp)
    // If mouse moves, intensity goes up, then slowly fades down
    const targetHover = hovered ? 15 : 0.5; // 0.2 means water always moves slightly
    meshRef.current.material.uniforms.uHover.value = THREE.MathUtils.lerp(
      meshRef.current.material.uniforms.uHover.value,
      targetHover,
    .1
    );

    // Convert mouse screen coords (-1 to 1) to UV coords (0 to 1)
    const mouseX = (state.pointer.x + 1) / 2;
    const mouseY = (state.pointer.y + 1) / 2;
    
    // Smoothly move the "center" of the liquid effect to the mouse
    meshRef.current.material.uniforms.uMouse.value.lerp(
        new THREE.Vector2(mouseX, mouseY),
        0.1
    );
  });

  return (
    <mesh 
      ref={meshRef} 
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};

// --- REACT UI COMPONENT ---

export default function CinematicLanding() {
  return ( 

    <div>
    <section className="w-full h-screen relative bg-black overflow-hidden">
      
      {/* 1. The Three.js Canvas Layer (Background) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
            <React.Suspense fallback={null}>
                <LiquidBackground />
            </React.Suspense>
        </Canvas>
      </div>

      {/* 2. The HTML Content Layer (Foreground) */}
      <main className="relative z-10 w-full h-full flex flex-col pointer-events-none pt-40">
        
 
     

        {/* Hero Content */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto w-full">
            
            <div className="overflow-hidden">
                <motion.h1 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
                    className="text-7xl md:text-9xl font-black text-transparent stroke-text uppercase tracking-tighter leading-[0.85]"
                    style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}
                >
                    Coming Soon!
                </motion.h1>
            </div>
            
            <div className="overflow-hidden mb-8">
                 <motion.h1 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.3 }}
                    className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85] mix-blend-overlay"
                >
                    Intervue
                </motion.h1>
            </div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="max-w-md text-white/70 text-lg md:text-xl font-light mb-12 mix-blend-difference"
            >
                We analyze candidates with forensic precision. A new world of data-driven hiring starts here.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex gap-4 pointer-events-auto"
            >
                <button className="group px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-3 hover:scale-105 transition-transform">
                    <span>Get Interview-Ready</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border border-white/30 text-white rounded-full hover:bg-white/10 backdrop-blur-sm transition-colors flex items-center gap-3">
                    <Play className="w-4 h-4 fill-current" />
                    <span>View Sample Report</span>
                </button>
            </motion.div>

        </div>

        {/* Footer Stats */}
        <div className="flex justify-center">
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 bg-black/20 backdrop-blur-md mt-auto pointer-events-auto max-w-6xl w-full">
            {[
                { label: 'Global Reach', val: '142', icon: Globe },
                { label: 'Processing', val: '99%', icon: Cpu },
                { label: 'Candidates', val: '50K+', icon: ArrowRight },
            ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest">
                        <stat.icon size={12} />
                        {stat.label}
                    </div>
                    <div className="text-2xl text-white font-mono">{stat.val}</div>
                </div>
            ))}
             <div className="flex flex-col justify-end">
                <div className="text-right text-white/40 text-xs">SCROLL TO EXPLORE</div>
            </div>
        </div></div>

      </main>
    </section>
     <section className="w-full min-h-screen relative bg-black overflow-hidden">
  {/* grid background */}
  <div
    className="pointer-events-none absolute inset-0 opacity-20"
    aria-hidden="true"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px",
    }}
  />

  {/* gradient glow */}
  <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

  <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:py-28">
    {/* Heading */}
    <div className="max-w-2xl space-y-4">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
        What we offer
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
        Interview prep that judges you like a real interviewer.
      </h2>
      <p className="text-sm sm:text-base text-neutral-400">
        Intervue analyzes your GitHub, communication, and delivery — not just
        whether you picked the right LeetCode problem.
      </p>
    </div>

    {/* Cards */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

      {/* Dark card */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 p-6 sm:p-7 backdrop-blur">
        <div className="absolute inset-px rounded-2xl border border-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <h3 className="text-base font-medium text-white sm:text-lg">
          GitHub–first evaluation
        </h3>
        <p className="mt-3 text-sm text-neutral-400">
          We read your repos, commit history, and structure to understand how you
          actually build — not how you describe it on your resume.
        </p>
      </div>

      {/* Light card */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-50/95 p-6 sm:p-7 text-neutral-900">
        <div className="absolute inset-px rounded-2xl border border-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <h3 className="text-base font-medium sm:text-lg">
          Conversation & delivery
        </h3>
        <p className="mt-3 text-sm text-neutral-700">
          Intervue tracks clarity, structure, and how you explain tradeoffs —
          the things humans actually judge in live interviews.
        </p>
      </div>

      {/* Dark card */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 p-6 sm:p-7 backdrop-blur">
        <div className="absolute inset-px rounded-2xl border border-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <h3 className="text-base font-medium text-white sm:text-lg">
          Actionable, brutal feedback
        </h3>
        <p className="mt-3 text-sm text-neutral-400">
          Get a clear readiness score, red flags, and a focused plan of what to
          fix before you walk into the next interview.
        </p>
      </div>

      {/* Extra cards if you want 4–6 items */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-50/95 p-6 sm:p-7 text-neutral-900">
        <h3 className="text-base font-medium sm:text-lg">
          Resume vs reality check
        </h3>
        <p className="mt-3 text-sm text-neutral-700">
          We compare your claims with your actual work to surface gaps and
          overstatements — quietly, so you can fix them.
        </p>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 p-6 sm:p-7 backdrop-blur">
        <h3 className="text-base font-medium text-white sm:text-lg">
          Role-based scoring
        </h3>
        <p className="mt-3 text-sm text-neutral-400">
          See where you stand for junior, mid, or senior roles, instead of a
          random “8.2 / 10” that means nothing.
        </p>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-50/95 p-6 sm:p-7 text-neutral-900">
  <div className="absolute inset-px rounded-2xl border border-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
  <h3 className="text-base font-medium sm:text-lg">
    Personalized improvement path
  </h3>
  <p className="mt-3 text-sm text-neutral-700">
    Intervue doesn’t just score you — it tells you exactly what to practice,
    what to ignore, and what will move the needle before your next interview.
  </p>
</div>

    </div>
  </div>
</section>

<footer className="relative w-full overflow-hidden bg-black">
  {/* background grid */}
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.1]"
    aria-hidden="true"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
      backgroundSize: "56px 56px",
    }}
  />

  {/* top fade */}
  <div className="pointer-events-none absolute top-0 left-0 h-24 w-full bg-gradient-to-b from-black to-transparent" />

  {/* glow orbs */}
  <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

  <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
    {/* main row */}
    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
      {/* Brand */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white tracking-tight">
          Intervue
        </h3>
        <p className="max-w-xs text-sm text-neutral-400">
          Interview evaluation grounded in real signals — code, clarity, and
          substance.
        </p>
        <p className="text-xs text-neutral-500">
          Built for developers, not resumes.
        </p>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-8 text-sm">
        <div className="space-y-4">
          <p className="uppercase tracking-wider text-neutral-500 text-xs">
            Product
          </p>
          <ul className="space-y-2">
            {["How it works", "Interview simulation", "Sample report", "Pricing"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-neutral-400 transition hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="uppercase tracking-wider text-neutral-500 text-xs">
            Company
          </p>
          <ul className="space-y-2">
            {["About", "Blog", "Careers", "Contact"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-neutral-400 transition hover:text-white"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Status / Trust */}
      <div className="flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <p className="uppercase tracking-wider text-neutral-500 text-xs">
            Platform status
          </p>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Coming soon! dont panic - oranges
          </div>
        </div>

        <div className="flex gap-4">
          {["GitHub", "X"].map((s) => (
            <a
              key={s}
              href="#"
              className="group inline-flex items-center gap-2 text-neutral-400 transition hover:text-white"
            >
              <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/20">
                {s[0]}
              </span>
              <span className="text-sm">{s}</span>
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* bottom */}
    <div className="mt-16 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-8">
      <p className="text-xs text-neutral-500">
        © {new Date().getFullYear()} Intervue. All rights reserved.
      </p>
      <div className="flex gap-6 text-xs text-neutral-500">
        {["Privacy", "Terms", "Security", "Ethics"].map((item) => (
          <a
            key={item}
            href="#"
            className="transition hover:text-white"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  </div>
</footer>

    
    </div>
  );
}