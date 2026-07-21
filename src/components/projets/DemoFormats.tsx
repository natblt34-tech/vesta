"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import type { Projet } from "@/lib/projets";
import Ajuste from "@/components/Ajuste";

/* L'animation vidéo, livrée en deux formats : 16:9 pour le web et les
   portails (sur un ordinateur portable), 9:16 pour les réseaux (sur un
   téléphone). Un seul tournage, deux livrables prêts à poster.
   Arrivée chorégraphiée au scroll, flottement discret une fois posés. */

export default function DemoFormats({ projet }: { projet: Projet }) {
  const wrap = useRef<HTMLDivElement>(null);
  const source = projet.video ? media(projet.video) : null;
  const poster = projet.poster ? media(projet.poster) : media(`${projet.image}.webp`);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const ecran = el.querySelector("[data-ecran]");
    const tel = el.querySelector("[data-tel]");

    if (prefersReducedMotion()) {
      gsap.set([ecran, tel], { autoAlpha: 1, y: 0, rotateX: 0, rotate: 0 });
      return;
    }

    /* État de départ, hors vue. */
    gsap.set([ecran, tel], { autoAlpha: 0 });

    let joue = false;
    const jouer = () => {
      if (joue) return;
      joue = true;
      const tl = gsap.timeline();
      tl.fromTo(
        ecran,
        { y: 90, autoAlpha: 0, rotateX: 18, transformOrigin: "50% 100%" },
        { y: 0, autoAlpha: 1, rotateX: 0, duration: 1, ease: "power3.out" },
      ).fromTo(
        tel,
        { y: 120, autoAlpha: 0, rotate: 8 },
        { y: 0, autoAlpha: 1, rotate: 0, duration: 0.9, ease: "back.out(1.5)" },
        "-=0.55",
      );
    };

    /* IntersectionObserver : robuste malgré le scroll verrouillé du hero.
       Filet : si la section est déjà à l'écran au montage, on joue. */
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          jouer();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  const Media = ({ classe }: { classe: string }) =>
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
      <h2
        className="voix-display max-w-4xl"
        style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)", lineHeight: 0.95 }}
      >
        <Ajuste>Un tournage,</Ajuste>
        <Ajuste>deux formats.</Ajuste>
      </h2>

      <div
        className="mt-8 grid items-end gap-10 md:mt-10 md:grid-cols-[1.7fr_1fr]"
        style={{ perspective: "1400px" }}
      >
        {/* L'ORDINATEUR PORTABLE — 16:9, le web et les portails. */}
        <figure data-ecran className="will-change-transform">
          {/* L'écran. */}
          <div
            className="relative mx-auto rounded-t-xl p-3 pb-4"
            style={{ background: "#0c0e12", border: "1px solid var(--color-filet)", borderBottom: "none" }}
          >
            {/* La caméra. */}
            <div
              className="absolute left-1/2 top-1.5 h-1 w-1 -translate-x-1/2 rounded-full"
              style={{ background: "var(--color-filet)" }}
            />
            <div className="mt-1.5 aspect-video w-full overflow-hidden" style={{ background: "var(--color-basalte)" }}>
              <Media classe="h-full w-full object-cover" />
            </div>
          </div>
          {/* La charnière et le clavier : la base trapézoïdale. */}
          <div
            className="relative mx-auto"
            style={{
              width: "112%",
              marginLeft: "-6%",
              height: "0.9rem",
              background: "linear-gradient(180deg, #16191e, #0c0e12)",
              borderInline: "1px solid var(--color-filet)",
              clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)",
            }}
          >
            {/* L'encoche d'ouverture. */}
            <div
              className="absolute left-1/2 top-0 h-1.5 w-16 -translate-x-1/2 rounded-b-lg"
              style={{ background: "var(--color-basalte)" }}
            />
          </div>
          <figcaption className="voix-mono mt-6" style={{ color: "var(--color-bronze)" }}>
            FORMAT 16:9 · SITE, PORTAILS, MAIL
          </figcaption>
        </figure>

        {/* LE TÉLÉPHONE — 9:16, les réseaux. */}
        <figure data-tel className="mx-auto w-full max-w-[210px] will-change-transform">
          <div data-tel-flot className="will-change-transform">
            <div
              className="relative overflow-hidden rounded-[2rem] p-2"
              style={{
                border: "1px solid var(--color-filet)",
                background: "#0c0e12",
                boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
              }}
            >
              {/* L'îlot dynamique. */}
              <div
                className="absolute left-1/2 top-3.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full"
                style={{ background: "var(--color-basalte)" }}
              />
              <div className="overflow-hidden rounded-[1.5rem]" style={{ aspectRatio: "9 / 16", background: "var(--color-basalte)" }}>
                <Media classe="h-full w-full object-cover" />
              </div>
            </div>
          </div>
          <figcaption className="voix-mono mt-6 text-center" style={{ color: "var(--color-bronze)" }}>
            FORMAT 9:16 · INSTAGRAM, TIKTOK, REELS
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
