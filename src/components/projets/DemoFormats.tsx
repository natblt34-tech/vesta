"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import type { Projet } from "@/lib/projets";

/* L'animation vidéo, livrée en deux formats : 16:9 pour le web et les
   portails, 9:16 pour les réseaux. On la montre en situation, sur un
   écran et sur un téléphone qui lisent le même film, chacun à son cadre.
   Un seul tournage, deux livrables prêts à poster. */

export default function DemoFormats({ projet }: { projet: Projet }) {
  const wrap = useRef<HTMLDivElement>(null);
  const source = projet.video ? media(projet.video) : null;
  const poster = projet.poster ? media(projet.poster) : media(`${projet.image}.webp`);

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const ecran = el.querySelector("[data-ecran]");
      const tel = el.querySelector("[data-tel]");

      gsap.fromTo(
        ecran,
        { yPercent: 14, opacity: 0, rotateY: 10 },
        {
          yPercent: 0,
          opacity: 1,
          rotateY: 0,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 78%", end: "top 40%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        tel,
        { yPercent: 26, opacity: 0, rotate: 4 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: el, start: "top 74%", end: "top 36%", scrub: 0.6 },
        },
      );
      /* Flottement lent et discret du téléphone, une fois posé. */
      gsap.to(tel, {
        yPercent: -2.5,
        duration: 3.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.8,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const Video = ({ classe }: { classe: string }) =>
    source ? (
      <video
        src={source}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className={classe}
        aria-hidden="true"
      />
    ) : (
      <img src={poster} alt="" aria-hidden="true" className={classe} />
    );

  return (
    <section ref={wrap} className="marge py-(--spacing-section)">
      <p className="voix-mono mb-4" style={{ color: "var(--color-braise-vive)" }}>
        03 · L&apos;ANIMATION VIDÉO
      </p>
      <h2
        className="voix-display max-w-3xl"
        style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
      >
        Un tournage, deux formats. Livrés prêts à poster.
      </h2>

      <div className="mt-16 grid items-end gap-12 md:grid-cols-[1.6fr_1fr] md:gap-8">
        {/* Écran 16:9 : le web, les portails, le mail. */}
        <figure data-ecran className="will-change-transform" style={{ perspective: "1200px" }}>
          <div
            className="overflow-hidden"
            style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
          >
            <div
              className="flex items-center gap-1.5 px-3 py-2"
              style={{ borderBottom: "1px solid var(--color-filet)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-filet)" }} />
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-filet)" }} />
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-filet)" }} />
              <span
                className="voix-mono ml-3"
                style={{ color: "var(--color-gris-pierre)", fontSize: "0.5625rem" }}
              >
                seloger.com / annonce
              </span>
            </div>
            <div className="aspect-video w-full overflow-hidden">
              <Video classe="h-full w-full object-cover" />
            </div>
          </div>
          {/* Le pied de l'écran. */}
          <div className="mx-auto h-4 w-1/4" style={{ background: "var(--color-basalte-2)" }} />
          <div
            className="mx-auto h-px w-2/5"
            style={{ background: "var(--color-filet)" }}
          />
          <figcaption className="voix-mono mt-5" style={{ color: "var(--color-bronze)" }}>
            FORMAT 16:9 · SITE, PORTAILS, MAIL
          </figcaption>
        </figure>

        {/* Téléphone 9:16 : Instagram, TikTok, Reels. */}
        <figure data-tel className="mx-auto w-full max-w-[220px] will-change-transform">
          <div
            className="relative overflow-hidden rounded-[2rem] p-2"
            style={{
              border: "1px solid var(--color-filet)",
              background: "var(--color-basalte-2)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
            }}
          >
            {/* L'îlot dynamique. */}
            <div
              className="absolute left-1/2 top-3.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full"
              style={{ background: "var(--color-basalte)" }}
            />
            <div
              className="overflow-hidden rounded-[1.5rem]"
              style={{ aspectRatio: "9 / 16" }}
            >
              <Video classe="h-full w-full object-cover" />
            </div>
          </div>
          <figcaption className="voix-mono mt-5 text-center" style={{ color: "var(--color-bronze)" }}>
            FORMAT 9:16 · INSTAGRAM, TIKTOK, REELS
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
