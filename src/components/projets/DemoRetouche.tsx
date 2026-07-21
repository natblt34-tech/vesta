"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import type { Projet } from "@/lib/projets";

/* La retouche, démontrée sur une vraie photo du projet : le scroll est
   le curseur avant/après. L'« avant » est la même image dégradée en CSS
   (sous-exposée, verticales tombantes) : l'alignement est parfait. */

const DEGRADE = "brightness(0.55) saturate(0.55) contrast(0.88) hue-rotate(-8deg)";

export default function DemoRetouche({ projet }: { projet: Projet }) {
  const r = projet.retouche;
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !r) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const apres = el.querySelector<HTMLElement>("[data-apres]");
      const bord = el.querySelector<HTMLElement>("[data-bord]");
      const avant = el.querySelector<HTMLElement>("[data-avant]");

      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.4,
          onUpdate: (self) => {
            const p = self.progress;
            const pc = p * 118 - 9;
            if (apres) apres.style.clipPath = `polygon(0 0, ${pc}% 0, ${pc - 8}% 100%, 0 100%)`;
            if (bord) {
              bord.style.left = `${Math.max(0, Math.min(100, pc - 4))}%`;
              bord.style.opacity = p > 0.02 && p < 0.98 ? "1" : "0";
            }
            if (avant) avant.style.rotate = `${1.4 * (1 - p)}deg`;
          },
        },
      });
    }, el);

    return () => ctx.revert();
  }, [r]);

  if (!r) return null;

  return (
    <div ref={wrap}>
      <section className="relative h-svh overflow-hidden">
        <img
          data-avant
          src={media(r.src)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: DEGRADE, rotate: "1.4deg", scale: "1.05" }}
        />
        <img
          data-apres
          src={media(r.src)}
          alt={`${projet.titre}, la ${r.piece.toLowerCase()} retouchée`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: prefersReducedMotion() ? "none" : "polygon(0 0, 0% 0, 0% 100%, 0 100%)" }}
        />
        <div
          data-bord
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-full w-px opacity-0"
          style={{
            background:
              "linear-gradient(180deg, transparent, var(--color-braise-vive) 30%, var(--color-braise-vive) 70%, transparent)",
            boxShadow: "0 0 24px 2px color-mix(in srgb, var(--color-braise-vive) 55%, transparent)",
          }}
        />

        <p
          className="voix-mono absolute bottom-10 left-[var(--spacing-marge)]"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)", fontSize: "0.75rem" }}
        >
          {r.piece} · {r.reglages}
        </p>
      </section>
    </div>
  );
}
