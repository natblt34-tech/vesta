"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import { MENTION_STAGING } from "@/lib/site";
import type { Projet } from "@/lib/projets";

/* Le home staging, en vidéo : une pièce vide qui se meuble. Entrée
   chorégraphiée au scroll (IntersectionObserver, robuste). */
export default function DemoStaging({ projet }: { projet: Projet }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    const cadre = el.querySelector("[data-cadre]");
    if (!cadre) return;
    gsap.set(cadre, { autoAlpha: 0 });
    let joue = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !joue) {
          joue = true;
          io.disconnect();
          gsap.fromTo(
            cadre,
            { y: 70, autoAlpha: 0, scale: 0.96 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 1, ease: "power3.out" },
          );
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!projet.stagingVideo) return null;
  const src = media(projet.stagingVideo);

  return (
    <section ref={wrap} className="marge py-(--spacing-section)">
      <h2
        className="voix-display max-w-4xl"
        style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)", lineHeight: 0.95 }}
      >
        La pièce se meuble.
      </h2>

      <figure data-cadre className="mt-10 will-change-transform">
        <div className="overflow-hidden" style={{ border: "1px solid var(--color-filet)" }}>
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="aspect-video w-full object-cover"
            aria-label={`Home staging vidéo — ${projet.titre}`}
          />
        </div>
        <figcaption className="voix-mono mt-4" style={{ color: "var(--color-gris-pierre)" }}>
          {MENTION_STAGING}
        </figcaption>
      </figure>
    </section>
  );
}
