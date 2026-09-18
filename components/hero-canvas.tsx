"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * The hero's 3D element: a polished form suspended over a wet-look reflective floor.
 *
 * Why 3D here rather than a photo — the CC0 photography available for this trade tops out
 * at 1024px, which is soft when used full-bleed on a retina display. A rendered scene is
 * resolution-independent, and a mirror-finish floor is exactly what the product is, so it
 * carries the hero while the real photographs do the proof-of-work further down the page.
 *
 * Costs are contained: the module is dynamically imported so three.js never lands in the
 * initial bundle, the loop is suspended whenever the canvas is off screen, and anyone with
 * prefers-reduced-motion gets a single static frame instead of an animation.
 */

function Scene({ animate }: { animate: boolean }) {
  const orb = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    // Damped parallax — the scene leans toward the cursor rather than snapping to it.
    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(delta * 2.2, 1);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(delta * 2.2, 1);

    state.camera.position.x = 0.35 + pointer.current.x * 0.45;
    state.camera.position.y = 1.5 + pointer.current.y * 0.22;
    state.camera.lookAt(0, 0.85, 0);

    if (!animate) return;
    if (orb.current) {
      orb.current.rotation.y += delta * 0.16;
      orb.current.position.y = 1.02 + Math.sin(state.clock.elapsedTime * 0.5) * 0.045;
    }
    if (ring.current) {
      ring.current.rotation.z += delta * 0.09;
      ring.current.rotation.x = -Math.PI / 2.35 + Math.sin(state.clock.elapsedTime * 0.32) * 0.05;
    }
  });

  return (
    <>
      {/* Procedural environment — built in-scene from emissive planes, so nothing is
          fetched from a CDN and the strict Content-Security-Policy still holds. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.1} position={[0, 5, -2]} scale={[10, 6, 1]} color="#fff6e6" />
        <Lightformer form="rect" intensity={1.5} position={[-4, 2, 2]} scale={[4, 6, 1]} color="#c79a5c" />
        <Lightformer form="rect" intensity={0.8} position={[4, 1.5, 1]} scale={[3, 5, 1]} color="#8fa6c4" />
        <Lightformer form="circle" intensity={2.6} position={[1.5, 4, 3]} scale={2} color="#ffffff" />
      </Environment>

      <ambientLight intensity={0.16} />
      <spotLight position={[3.5, 6, 3]} angle={0.5} penumbra={1} intensity={28} color="#ffe9c9" castShadow={false} />

      {/* The floor. This is the product: a poured surface with a mirror finish. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[42, 42]} />
        <MeshReflectorMaterial
          resolution={512}
          mixBlur={0.85}
          mixStrength={22}
          blur={[320, 90]}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          roughness={0.32}
          metalness={0.62}
          color="#1a1916"
          mirror={0}
        />
      </mesh>

      <mesh ref={orb} position={[0, 1.02, 0]} castShadow={false}>
        <sphereGeometry args={[0.62, 64, 64]} />
        <meshStandardMaterial color="#cbb086" metalness={1} roughness={0.14} envMapIntensity={1.5} />
      </mesh>

      {/* A thin disc reading as a poured sample plate catching the light. */}
      <mesh ref={ring} position={[0, 0.52, 0]} rotation={[-Math.PI / 2.35, 0, 0]}>
        <torusGeometry args={[1.35, 0.022, 20, 140]} />
        <meshStandardMaterial color="#e8e2d6" metalness={0.95} roughness={0.2} envMapIntensity={1.2} />
      </mesh>

      <fog attach="fog" args={["#100f0d", 6, 21]} />
    </>
  );
}

export default function HeroCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAnimate(!reduce.matches);
    const onChange = () => setAnimate(!reduce.matches);
    reduce.addEventListener("change", onChange);
    return () => reduce.removeEventListener("change", onChange);
  }, []);

  // Suspend the render loop entirely while the hero is scrolled out of view.
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.05 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div className="hero-canvas" ref={host}>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0.35, 1.5, 4.2], fov: 38 }}
        frameloop={active ? "always" : "never"}
        onCreated={({ gl }) => gl.setClearColor("#100f0d")}
      >
        <Scene animate={animate} />
      </Canvas>
      <div className="hero-canvas-grain" aria-hidden="true" />
    </div>
  );
}
