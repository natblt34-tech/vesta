"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setPlan } from "./homeStatus";
import { media } from "@/lib/media";

/* « LE SCROLL EST LE FILM » — chaque glyphe est une fenêtre sur la même frame.
   Les lettres dérivent puis se recomposent. */

const LIGNES = ["LE SCROLL", "EST LE FILM"];

export default function Manifeste() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>("[data-glyphe]");
      chars.forEach((c, i) => {
        const derive = (i % 2 === 0 ? 1 : -1) * (14 + (i % 5) * 10);
        gsap.fromTo(
          c,
          { yPercent: derive },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top 90%",
              end: "center 45%",
              scrub: 0.5,
              onEnter: () => setPlan("PLAN 02 · MANIFESTE"),
              onEnterBack: () => setPlan("PLAN 02 · MANIFESTE"),
            },
          },
        );
      });
    }, sec);

    return () => ctx.revert();
  }, []);

  /* Chaque glyphe cadre une portion différente de la même image :
     la position du fond est dérivée de l'index. */
  let index = 0;

  return (
    <section ref={section} className="marge flex min-h-[80svh] flex-col justify-center py-(--spacing-section)">
      <h2 className="sr-only">Le scroll est le film</h2>
      <p className="voix-display" aria-hidden="true" style={{ fontSize: "var(--text-display)" }}>
        {LIGNES.map((ligne, li) => (
          <span key={li} className="block">
            {ligne.split("").map((c, i) => {
              const pos = index++;
              if (c === " ") return <span key={i}> </span>;
              return (
                <span
                  key={i}
                  data-glyphe
                  className="inline-block will-change-transform"
                  style={{
                    backgroundImage: `linear-gradient(rgba(18,21,26,0.1), rgba(18,21,26,0.1)), url(${media("salon-apres.webp")})`,
                    backgroundSize: "900% auto",
                    backgroundPosition: `${(pos * 13) % 100}% ${(pos * 29) % 100}%`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {c}
                </span>
              );
            })}
          </span>
        ))}
      </p>
      <p className="mt-10 max-w-lg" style={{ color: "var(--color-gris-pierre)" }}>
        Pas de lecteur vidéo ici. La visite avance quand vous scrollez, image par
        image — comme au banc de montage. Chaque lettre est une fenêtre sur la
        même frame.
      </p>
    </section>
  );
}
