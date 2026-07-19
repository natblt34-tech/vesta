"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setPlan } from "./homeStatus";
import { media } from "@/lib/media";

/* 9 photos → un film. La planche contact converge vers l'ordre du montage. */

const SOURCES = ["salon-apres", "cuisine-porte", "salon-meuble"] as const;

const TUILES = Array.from({ length: 9 }, (_, i) => ({
  img: SOURCES[i % 3],
  pos: `${(i * 37) % 100}% ${(i * 53) % 100}%`,
  x: ((i * 17) % 24) - 12,
  y: ((i * 29) % 36) - 18,
  r: ((i * 11) % 9) - 4,
}));

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
      <div className="grid grid-cols-3 gap-2">
        {TUILES.map((t, i) => (
          <div
            key={i}
            data-tuile
            data-x={t.x}
            data-y={t.y}
            data-r={t.r}
            className="aspect-4/3 will-change-transform"
            style={{
              backgroundImage: `url(${media(`${t.img}.webp`)})`,
              backgroundSize: "300%",
              backgroundPosition: t.pos,
              filter: "saturate(0.8) brightness(0.9)",
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div>
        <h2 className="voix-display" style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}>
          9 photos.
          <br />
          Un film.
        </h2>
        <p className="mt-6 max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
          Vous envoyez les photos de l&apos;annonce. La génération est faite par IA.
          Le montage est fait par un humain, image par image :
          choix des plans, raccords, rythme, étalonnage. C&apos;est la différence
          entre un effet et un film.
        </p>
        <dl className="voix-mono mt-8 grid grid-cols-3 gap-4" style={{ color: "var(--color-bronze)" }}>
          <div>
            <dt className="sr-only">Photos nécessaires</dt>
            <dd>9 PHOTOS</dd>
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
