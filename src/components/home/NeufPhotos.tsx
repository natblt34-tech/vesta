"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import { setPlan } from "./homeStatus";

/* Quatre photos, un film : le vrai brief de la maison Côte Pavée.
   La planche contact converge vers l'ordre du montage. */

const PHOTOS = [
  { img: "brief-salon.webp", alt: "Photo du brief : le salon", x: -14, y: -16, r: -3 },
  { img: "brief-chambre.webp", alt: "Photo du brief : la chambre", x: 12, y: -10, r: 2 },
  { img: "brief-cuisine.webp", alt: "Photo du brief : la cuisine", x: -10, y: 14, r: 3 },
  { img: "brief-entree.webp", alt: "Photo du brief : l'entrée", x: 15, y: 12, r: -2 },
];

export default function NeufPhotos() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-tuile]").forEach((t) => {
        gsap.fromTo(
          t,
          {
            x: `${t.dataset.x}vw`,
            y: `${t.dataset.y}vh`,
            rotate: Number(t.dataset.r),
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top 85%",
              end: "center 50%",
              scrub: 0.6,
              onEnter: () => setPlan("PLAN 05 · DÉRUSHAGE"),
              onEnterBack: () => setPlan("PLAN 05 · DÉRUSHAGE"),
            },
          },
        );
      });
    }, sec);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      className="marge grid items-center gap-14 py-(--spacing-section) md:grid-cols-2"
    >
      <div className="grid grid-cols-2 gap-2">
        {PHOTOS.map((p) => (
          <img
            key={p.img}
            data-tuile
            data-x={p.x}
            data-y={p.y}
            data-r={p.r}
            src={media(p.img)}
            alt={p.alt}
            loading="lazy"
            className="aspect-4/3 w-full object-cover will-change-transform"
          />
        ))}
      </div>

      <div>
        <h2 className="voix-display" style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}>
          Quatre photos.
          <br />
          Un film.
        </h2>
        <p className="mt-6 max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
          Ce sont les quatre vraies photos du brief de la maison Côte Pavée, et
          le film que vous traversez depuis le début de cette page. La
          génération est faite par IA. Le montage est fait par un humain, image
          par image : choix des plans, raccords, rythme, étalonnage. C&apos;est la
          différence entre un effet et un film.
        </p>
        <dl className="voix-mono mt-8 grid grid-cols-3 gap-4" style={{ color: "var(--color-bronze)" }}>
          <div>
            <dt className="sr-only">Photos nécessaires</dt>
            <dd>4 PHOTOS</dd>
          </div>
          <div>
            <dt className="sr-only">Montage</dt>
            <dd>MONTÉ MAIN</dd>
          </div>
          <div>
            <dt className="sr-only">Délai</dt>
            <dd>72 H</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
