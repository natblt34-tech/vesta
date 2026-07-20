"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { CAL_URL } from "@/lib/site";
import { media } from "@/lib/media";
import { useFitText } from "@/lib/useFitText";
import FragmentVesta from "@/components/vesta/FragmentVesta";
import { Etoile } from "@/components/chrome/Logo";
import { setPlan } from "./homeStatus";

/* Le hero : VESTA en pleine largeur, le film vit dans les contreformes.
   Une punchline, un rendez-vous. Le client comprend en un clin d'œil. */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const titre = useRef<HTMLHeadingElement>(null);
  useFitText(section);

  useEffect(() => {
    const sec = section.current;
    const h1 = titre.current;
    if (!sec || !h1) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      /* Le film avance dans les lettres : la position du fond suit le scroll,
         la fonte se resserre en quittant le plan. */
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
        className="absolute left-[2vw] top-1/2 hidden w-[12vw] max-w-48 -translate-y-1/2 md:block"
      >
        <FragmentVesta variant="vesta" />
      </div>
      <div
        data-flanc
        className="absolute right-[2vw] top-1/2 hidden w-[12vw] max-w-48 -translate-y-1/2 md:block"
      >
        <FragmentVesta variant="flamme" miroir />
      </div>

      <h1
        ref={titre}
        data-fit
        className="voix-display select-none whitespace-nowrap text-center"
        style={{
          fontSize: "24vw",
          backgroundImage: `linear-gradient(rgba(18,21,26,0.14), rgba(18,21,26,0.14)), url(${media("visite-poster.jpg")})`,
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
        className="voix-display mt-6 text-center"
        style={{ fontSize: "clamp(1.375rem, 3vw, 2.5rem)", color: "var(--color-pierre)" }}
      >
        On rallume vos annonces
        <Etoile taille="1em" />
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
        className="voix-mono absolute bottom-6 left-[var(--spacing-marge)]"
        style={{ color: "var(--color-gris-pierre)" }}
      >
        <Etoile taille="1.2em" /> Le premier film est offert
      </p>

      <p
        className="voix-mono absolute bottom-6 right-[var(--spacing-marge)]"
        style={{ color: "var(--color-gris-pierre)" }}
        aria-hidden="true"
      >
        Scrollez, la barre de scroll est la timeline
      </p>
    </section>
  );
}
