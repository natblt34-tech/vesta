"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/* Le curseur : un point braise net, un anneau fin qui traîne d'un souffle.
   Pas de pulsation, pas de halo. Sur l'interactif, l'anneau s'ouvre et
   s'embrase. Pointeurs fins uniquement, jamais au tactile. */
export default function Cursor() {
  const point = useRef<HTMLDivElement>(null);
  const anneau = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = point.current;
    const a = anneau.current;
    if (!p || !a) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.body.dataset.cursorActive = "true";
    const px = gsap.quickTo(p, "x", { duration: 0.12, ease: "power3.out" });
    const py = gsap.quickTo(p, "y", { duration: 0.12, ease: "power3.out" });
    const ax = gsap.quickTo(a, "x", { duration: 0.38, ease: "power3.out" });
    const ay = gsap.quickTo(a, "y", { duration: 0.38, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      p.style.opacity = "1";
      a.style.opacity = "1";
      px(e.clientX);
      py(e.clientY);
      ax(e.clientX);
      ay(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor]");
      gsap.to(a, {
        scale: interactive ? 1.6 : 1,
        borderColor: interactive ? "var(--color-braise-vive)" : "var(--color-bronze)",
        opacity: interactive ? 1 : 0.6,
        duration: 0.25,
        ease: "power3.out",
      });
    };

    const leave = () => {
      p.style.opacity = "0";
      a.style.opacity = "0";
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);

    return () => {
      delete document.body.dataset.cursorActive;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div
        ref={anneau}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-100 h-7 w-7 rounded-full border opacity-0"
        style={{
          translate: "-50% -50%",
          borderColor: "var(--color-bronze)",
          borderWidth: "1px",
          opacity: 0,
        }}
      />
      <div
        ref={point}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-100 h-1 w-1 rounded-full opacity-0"
        style={{ translate: "-50% -50%", background: "var(--color-braise-vive)" }}
      />
    </>
  );
}
