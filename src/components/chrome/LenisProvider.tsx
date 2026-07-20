"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/* Lenis porte la qualité perçue du scrub. Coupé sous reduced-motion. */
export default function LenisProvider() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* Le hero scroll-expansion verrouille la page tant que le film
       n'est pas déployé : il pilote lui-même la molette. */
    const lock = () => lenis.stop();
    const unlock = () => lenis.start();
    window.addEventListener("vesta:scroll-lock", lock);
    window.addEventListener("vesta:scroll-unlock", unlock);

    return () => {
      window.removeEventListener("vesta:scroll-lock", lock);
      window.removeEventListener("vesta:scroll-unlock", unlock);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
