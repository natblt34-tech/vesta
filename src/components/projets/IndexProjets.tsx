"use client";

import { useEffect, useRef, useState } from "react";
import { PROJETS } from "@/lib/projets";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setStatus } from "@/lib/status";
import { TransitionLink } from "@/components/chrome/Transition";
import LigneClaire from "@/components/vesta/LigneClaire";
import { media } from "@/lib/media";

/* L'index (réf. edit.church) : une liste typographique dense.
   La ligne s'ouvre au survol, l'extrait apparaît dans la marge —
   une seule plaque média réutilisée. */
export default function IndexProjets() {
  const [actif, setActif] = useState<number | null>(null);
  const plate = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatus(`${PROJETS.length} FILMS LIVRÉS · INDEX 0%`);
    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) =>
        setStatus(`${PROJETS.length} FILMS LIVRÉS · INDEX ${Math.round(self.progress * 100)}%`),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    const el = plate.current;
    if (!el || prefersReducedMotion()) return;
    if (actif !== null) {
      gsap.fromTo(
        el,
        { clipPath: "inset(12% 0% 12% 0%)", scale: 1.04 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.45, ease: "power3.out" },
      );
    }
  }, [actif]);

  const projet = actif !== null ? PROJETS[actif] : null;

  return (
    <section className="marge grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
      <ul>
        {PROJETS.map((p, i) => {
          const est = actif === i;
          return (
            <li key={p.slug} className="filet">
              <TransitionLink
                href={`/projets/${p.slug}`}
                onMouseEnter={() => setActif(i)}
                onFocus={() => setActif(i)}
                className="group block py-6"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                  <span
                    className="voix-display transition-colors duration-200 group-hover:text-(--color-braise-vive)"
                    style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
                  >
                    {p.titre}
                  </span>
                  <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
                    {p.type} · {p.surface} M² · {p.quartier}
                  </span>
                </span>
                <span
                  className="voix-mono mt-2 block"
                  style={{ color: "var(--color-bronze)" }}
                >
                  {p.photos} PHOTOS FOURNIES · {p.traversees.length} TRAVERSÉE
                  {p.traversees.length > 1 ? "S" : ""} · {p.duree} S
                </span>
                <span
                  className="grid transition-[grid-template-rows] duration-400 lg:hidden"
                  style={{ gridTemplateRows: est ? "1fr" : "0fr" }}
                >
                  <span className="overflow-hidden">
                    <span
                      className="mt-4 block aspect-video bg-cover"
                      style={{ backgroundImage: `url(${media(`${p.image}.webp`)})`, backgroundPosition: p.posPlate }}
                    />
                  </span>
                </span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>

      <div className="relative hidden lg:block">
        <div className="sticky top-28">
          {projet ? (
            <figure ref={plate}>
              <div
                className="aspect-video bg-cover"
                style={{
                  backgroundImage: `url(${media(`${projet.image}.webp`)})`,
                  backgroundPosition: projet.posPlate,
                }}
                role="img"
                aria-label={`Extrait du film ${projet.titre}`}
              />
              <figcaption className="voix-mono mt-3" style={{ color: "var(--color-gris-pierre)" }}>
                EXTRAIT · {projet.titre.toUpperCase()} · {projet.duree} S
              </figcaption>
            </figure>
          ) : (
            <div className="w-32 opacity-70">
              <LigneClaire variant="cadre" ton="bronze" />
              <p className="voix-mono mt-4" style={{ color: "var(--color-gris-pierre)" }}>
                SURVOLEZ UNE LIGNE
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
