"use client";

import dynamic from "next/dynamic";

/**
 * Lazy boundary for the 3D hero. `ssr: false` keeps three.js out of the server render and
 * out of the initial JS payload; the placeholder below is a plain CSS gradient, so the
 * hero has a finished-looking surface from the first paint and on any device where WebGL
 * is unavailable or blocked.
 */
const HeroCanvas = dynamic(() => import("@/components/hero-canvas"), {
  ssr: false,
  loading: () => <div className="hero-canvas hero-canvas-fallback" aria-hidden="true" />,
});

export function HeroStage() {
  return <HeroCanvas />;
}
