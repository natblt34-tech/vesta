"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import type { Projet } from "@/lib/projets";

/* L'animation vidéo, démontrée par la traversée : la caméra franchit un
   passage, un portail circulaire (le temple rond) s'ouvre sur la pièce
   suivante. Scrubé au scroll. C'est le différenciateur produit. */

export default function DemoTraversee({ projet }: { projet: Projet }) {
  const t = projet.traversee;
  const wrap = useRef<HTMLDivElement>(null);
  const [tc, setTc] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !t) return;
    if (prefersReducedMotion()) {
      setTc(t.duree);
      const arrivee = el.querySelector<HTMLElement>("[data-arrivee]");
      if (arrivee) arrivee.style.clipPath = "circle(150% at 50% 50%)";
      return;
    }

    const ctx = gsap.context(() => {
      const depart = el.querySelector("[data-depart]");
      const arrivee = el.querySelector("[data-arrivee]");
      const lueur = el.querySelector("[data-lueur]");
      const o = t.origine;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => setTc(Math.min(t.duree, self.progress * t.duree)),
        },
      });

      tl.fromTo(depart, { scale: 1 }, { scale: 1.16, duration: 0.35, ease: "none" }, 0);
      tl.fromTo(
        arrivee,
        { clipPath: `circle(0% at ${o})` },
        { clipPath: `circle(75% at ${o})`, duration: 0.45, ease: "none" },
        0.3,
      );
      tl.fromTo(lueur, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.3).to(
        lueur,
        { opacity: 0, duration: 0.2 },
        0.55,
      );
      tl.fromTo(arrivee, { scale: 1.12 }, { scale: 1, duration: 0.45, ease: "none" }, 0.55);
    }, el);

    return () => ctx.revert();
  }, [t]);

  if (!t) return null;

  return (
    <div ref={wrap}>
      <section className="relative h-svh overflow-hidden">
        <img
          data-depart
          src={media(t.depart)}
          alt={`${projet.titre}, ${t.depuis.toLowerCase()}`}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
        <img
          data-arrivee
          src={media(t.arrivee)}
          alt={`${projet.titre}, ${t.vers.toLowerCase()}, au bout de la traversée`}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ clipPath: `circle(0% at ${t.origine})` }}
        />
        <div
          data-lueur
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background: `radial-gradient(circle at ${t.origine}, color-mix(in srgb, var(--color-braise-vive) 35%, transparent) 0%, transparent 40%)`,
          }}
        />

        <div className="absolute inset-x-0 top-10 flex items-baseline justify-between p-[var(--spacing-marge)]">
          <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
            03 · L&apos;ANIMATION VIDÉO
          </p>
        </div>
        <p
          className="voix-mono absolute bottom-10 left-[var(--spacing-marge)]"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
        >
          TRAVERSÉE · {t.depuis} → {t.vers} · {tc.toFixed(1).padStart(4, "0")} S
        </p>
      </section>
    </div>
  );
}
