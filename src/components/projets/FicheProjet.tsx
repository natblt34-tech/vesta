"use client";

import { useEffect } from "react";
import type { Projet } from "@/lib/projets";
import { setStatus } from "@/lib/status";
import { TransitionLink } from "@/components/chrome/Transition";
import RendezVous from "@/components/chrome/RendezVous";
import { media } from "@/lib/media";
import { useRef } from "react";
import { useFitText } from "@/lib/useFitText";

/* La fiche : l'entrée (photos moyennes) contre la sortie (le film).
   Le contraste EST l'argument. */
export default function FicheProjet({ projet }: { projet: Projet }) {
  const racine = useRef<HTMLElement>(null);
  useFitText(racine);

  useEffect(() => {
    setStatus(`${projet.titre.toUpperCase()} · ${projet.duree} S`);
  }, [projet]);

  return (
    <main ref={racine}>
      <section className="relative flex h-[86svh] items-end overflow-hidden">
        <img
          src={media(`${projet.image}.webp`)}
          alt={`Image du film — ${projet.titre}`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: projet.posPlate }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(18,21,26,0.1) 40%, rgba(18,21,26,0.72))" }}
        />
        <div className="relative z-1 w-full p-[var(--spacing-marge)] pb-12">
          <p className="voix-mono mb-3" style={{ color: "var(--color-braise-vive)" }}>
            FILM LIVRÉ · {projet.duree} S
          </p>
          <h1
            data-fit
            className="voix-display w-fit whitespace-nowrap"
            style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)" }}
          >
            {projet.titre}
          </h1>
          <p className="voix-mono mt-4" style={{ color: "var(--color-pierre)" }}>
            {projet.type} · {projet.surface} M² · {projet.quartier} · {projet.photos} PHOTOS FOURNIES
          </p>
        </div>
      </section>

      <section className="marge grid gap-12 py-(--spacing-section) md:grid-cols-2">
        <div>
          <h2 className="voix-mono mb-6" style={{ color: "var(--color-bronze)" }}>
            LE BRIEF — CE QUE L&apos;AGENCE A FOURNI
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: Math.min(projet.photos, 9) }, (_, i) => (
              <div
                key={i}
                className="aspect-4/3"
                style={{
                  backgroundImage: `url(${media(`${projet.image}.webp`)})`,
                  backgroundSize: "340%",
                  backgroundPosition: `${(i * 41) % 100}% ${(i * 67) % 100}%`,
                  filter: "brightness(0.6) saturate(0.5) contrast(0.85)",
                }}
                role="img"
                aria-label={`Photo brute ${i + 1} fournie par l'agence`}
              />
            ))}
          </div>
          <p className="mt-6 max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
            {projet.brief}
          </p>
        </div>

        <div>
          <h2 className="voix-mono mb-6" style={{ color: "var(--color-bronze)" }}>
            LES TRAVERSÉES DU FILM
          </h2>
          <ul>
            {projet.traversees.map((t, i) => (
              <li
                key={t.nom}
                className="filet voix-mono flex items-baseline justify-between py-4"
                style={{ color: "var(--color-pierre)" }}
              >
                <span>
                  TRAVERSÉE {String(i + 1).padStart(2, "0")} · {t.nom}
                </span>
                <span style={{ color: "var(--color-gris-pierre)" }}>{t.duree} S</span>
              </li>
            ))}
          </ul>
          <h2 className="voix-mono mb-4 mt-12" style={{ color: "var(--color-bronze)" }}>
            LE RÉSULTAT
          </h2>
          <p className="max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
            {projet.resultat}
          </p>
          <TransitionLink
            href="/projets"
            className="voix-mono mt-10 inline-block underline underline-offset-4"
            style={{ color: "var(--color-pierre)" }}
          >
            ← Tous les projets
          </TransitionLink>
        </div>
      </section>

      <RendezVous />
    </main>
  );
}
