"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setPlan } from "./homeStatus";
import { media } from "@/lib/media";

/* LA TRAVERSÉE — le différenciateur produit, nommé et montré.
   La caméra pousse dans le salon, un portail circulaire (le temple rond)
   s'ouvre sur la cuisine, on la franchit. */
export default function Traversee() {
  const wrap = useRef<HTMLDivElement>(null);
  const [tc, setTc] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const salon = el.querySelector("[data-salon]");
      const cuisine = el.querySelector("[data-cuisine]");
      const lueur = el.querySelector("[data-lueur]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=280%",
          pin: true,
          scrub: 0.5,
          onEnter: () => setPlan("TRAVERSÉE 01 · SALON → CUISINE"),
          onEnterBack: () => setPlan("TRAVERSÉE 01 · SALON → CUISINE"),
          onUpdate: (self) => setTc(Math.min(6, self.progress * 6)),
        },
      });

      /* 0 → .35 : push-in dans le salon. */
      tl.fromTo(salon, { scale: 1 }, { scale: 1.16, duration: 0.35, ease: "none" }, 0);
      /* .3 → .75 : le portail s'ouvre — cercle du temple. */
      tl.fromTo(
        cuisine,
        { clipPath: "circle(0% at 50% 56%)" },
        { clipPath: "circle(75% at 50% 56%)", duration: 0.45, ease: "none" },
        0.3,
      );
      tl.fromTo(lueur, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.3).to(
        lueur,
        { opacity: 0, duration: 0.2 },
        0.55,
      );
      /* .55 → 1 : on est passés. La cuisine se pose. */
      tl.fromTo(cuisine, { scale: 1.12 }, { scale: 1, duration: 0.45, ease: "none" }, 0.55);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} className="relative">
      <section className="relative h-svh overflow-hidden">
        <img
          data-salon
          src={media("salon-apres.webp")}
          alt="Salon du bien témoin, lumière du soir sur le mur de brique"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
        <img
          data-cuisine
          src={media("cuisine-porte.webp")}
          alt="La cuisine, vue depuis la porte du salon"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ clipPath: "circle(0% at 50% 56%)" }}
        />
        <div
          data-lueur
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(circle at 50% 56%, color-mix(in srgb, var(--color-braise-vive) 35%, transparent) 0%, transparent 40%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-[var(--spacing-marge)]">
          <p
            className="voix-mono"
            style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
          >
            TRAVERSÉE 01 · SALON → CUISINE · {tc.toFixed(1).padStart(4, "0")} S
          </p>
          <p
            className="voix-mono hidden sm:block"
            style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
          >
            DEUX PHOTOS · UNE ANCRE DE DÉPART · UNE ANCRE D&apos;ARRIVÉE
          </p>
        </div>
      </section>

      <div className="marge max-w-xl py-(--spacing-section)">
        <p className="voix-mono mb-4" style={{ color: "var(--color-bronze)" }}>
          LA SIGNATURE VESTA
        </p>
        <p style={{ color: "var(--color-pierre)" }}>
          Une traversée, c&apos;est un clip à deux ancres : la photo d&apos;une pièce, la
          photo de la suivante. Entre les deux, la caméra franchit réellement le
          passage. Personne d&apos;autre ne livre ça à partir de simples photos.
        </p>
      </div>
    </div>
  );
}
