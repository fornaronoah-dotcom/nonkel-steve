"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenis: Lenis | null = null;

/** Zet scrollen even stil, bv. terwijl het mobiele menu open is. */
export function lockScroll(locked: boolean) {
  document.body.style.overflow = locked ? "hidden" : "";
  if (locked) lenis?.stop();
  else lenis?.start();
}

/** Zachte, vloeiende scroll (Lenis). Uit bij 'beperk beweging'. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      // Ankerlinks (#uren, #frieten…) ook vloeiend; houdt rekening met scroll-padding/-margin.
      anchors: true,
    });

    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
