"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import { setPlan } from "./homeStatus";

/* Le SEUL plan plein cadre du site : le vrai film, en lecture.
   L'impact vient du contraste, tout le reste est masqué. */
export default function PleinEcran() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector("[data-plan]"),
        { scale: 1.08 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: 0.6,
            onEnter: () => setPlan("PLAN 04 · LE FILM · PLEIN CADRE"),
            onEnterBack: () => setPlan("PLAN 04 · LE FILM · PLEIN CADRE"),
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap}>
      <section className="relative h-svh overflow-hidden">
        <video
          data-plan
          src={media("visite.mp4")}
          poster={media("visite-poster.jpg")}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          aria-label="Extrait du film livré pour la maison Côte Pavée"
        />
        <p
          className="voix-mono absolute left-[var(--spacing-marge)] top-12"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
        >
          PLAN 04 · LE FILM LIVRÉ · MAISON CÔTE PAVÉE · 47 S
        </p>
      </section>
    </div>
  );
}
