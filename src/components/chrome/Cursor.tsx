"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/* Le curseur : un point braise unique en mix-blend-difference, qui grossit
   et passe pierre au survol des zones interactives. Pointeurs fins seulement. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.body.dataset.cursorActive = "true";
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.16, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.16, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      el.classList.add("is-visible");
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor], input, textarea");
      el.classList.toggle("is-hover", !!interactive);
    };

    const leave = () => el.classList.remove("is-visible");

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

  return <div ref={dot} aria-hidden="true" className="cursor-braise" />;
}
