"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { CAL_URL } from "@/lib/site";
import { media } from "@/lib/media";
import LigneClaire from "@/components/vesta/LigneClaire";
import { setPlan } from "./homeStatus";

/* Le hero : VESTA en colossal, le film vit dans les contreformes.
   Les flancs symétriques (dispositif dock.cool) portent la ligne claire. */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const titre = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const sec = section.current;
    const h1 = titre.current;
    if (!sec || !h1) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      /* Le film avance dans les lettres : la position du fond suit le scroll,
         la fonte se resserre — l'anamorphique se referme en quittant le plan. */
      gsap.fromTo(
        h1,
        { backgroundPositionY: "30%", fontStretch: "125%" },
        {
          backgroundPositionY: "70%",
          fontStretch: "95%",
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "bottom top",
            scrub: 0.4,
            onEnter: () => setPlan("OUVERTURE"),
            onEnterBack: () => setPlan("OUVERTURE"),
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-flanc]").forEach((el, i) => {
        gsap.to(el, {
          yPercent: i === 0 ? -18 : -30,
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: 0.8 },
        });
      });
    }, sec);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden"
    >
      <div
        data-flanc
        className="pointer-events-none absolute left-[2vw] top-1/2 hidden w-[11vw] max-w-40 -translate-y-1/2 md:block"
      >
        <LigneClaire variant="vesta" ton="bronze" />
      </div>
      <div
        data-flanc
        className="pointer-events-none absolute right-[2vw] top-1/2 hidden w-[11vw] max-w-40 -translate-y-1/2 scale-x-[-1] md:block"
      >
        <LigneClaire variant="flamme" ton="bronze" />
      </div>

      <p className="voix-mono mb-6" style={{ color: "var(--color-bronze)" }}>
        Studio vidéo immobilier · Toulouse
      </p>

      <h1
        ref={titre}
        className="voix-display select-none text-center"
        style={{
          fontSize: "var(--text-colossal)",
          backgroundImage: `linear-gradient(rgba(18,21,26,0.18), rgba(18,21,26,0.18)), url(${media("salon-apres.webp")})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        VESTA
      </h1>

      <p
        className="voix-display mt-4 text-center"
        style={{ fontSize: "clamp(1.25rem, 2.6vw, 2.25rem)", color: "var(--color-pierre)" }}
      >
        Le feu avant la visite
      </p>

      <p
        className="mt-6 max-w-md text-balance px-6 text-center"
        style={{ color: "var(--color-gris-pierre)" }}
      >
        Vos photos deviennent un film. Génération par IA, montage humain, image par
        image. Ce que vous allez voir en scrollant, c&apos;est le produit.
      </p>

      <a
        href={CAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="voix-mono mt-10 inline-flex items-center gap-3 border px-6 py-4 transition-colors duration-200 hover:border-(--color-braise-vive)"
        style={{ borderColor: "var(--color-filet)", color: "var(--color-pierre)" }}
      >
        <span className="braise-point" aria-hidden="true" />
        Prendre rendez-vous
      </a>

      <p
        className="voix-mono absolute bottom-6 left-1/2 -translate-x-1/2"
        style={{ color: "var(--color-gris-pierre)" }}
        aria-hidden="true"
      >
        Scrollez — la barre de scroll est la timeline
      </p>
    </section>
  );
}
