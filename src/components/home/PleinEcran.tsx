"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setPlan } from "./homeStatus";
import { media } from "@/lib/media";

/* Le SEUL plan plein cadre du site. Travelling latéral lent, scrubé.
   L'impact vient du contraste : tout le reste est masqué. */
export default function PleinEcran() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector("[data-plan]"),
        { xPercent: -6, scale: 1.12 },
        {
          xPercent: 6,
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=180%",
            pin: true,
            scrub: 0.6,
            onEnter: () => setPlan("PLAN 04 · SÉJOUR · PLEIN CADRE"),
            onEnterBack: () => setPlan("PLAN 04 · SÉJOUR · PLEIN CADRE"),
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap}>
      <section className="relative h-svh overflow-hidden">
        <img
          data-plan
          src={media("salon-meuble.webp")}
          alt="Séjour habité au soir, lampe laiton allumée — plan plein cadre du film"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
        <p
          className="voix-mono absolute left-[var(--spacing-marge)] top-12"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
        >
          PLAN 04 · LE SEUL PLEIN CADRE DU SITE
        </p>
      </section>
    </div>
  );
}
