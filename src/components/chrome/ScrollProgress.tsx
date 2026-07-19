"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/* La timeline du film : un filet qui s'embrase en haut de page. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        gsap.set(el, { scaleX: self.progress });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-95 h-px origin-left"
      style={{
        scale: "0 1",
        background:
          "linear-gradient(90deg, var(--color-braise) 0%, var(--color-braise-vive) 100%)",
        boxShadow: "0 0 8px color-mix(in srgb, var(--color-braise) 50%, transparent)",
      }}
    />
  );
}
