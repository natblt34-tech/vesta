"use client";

import { useState } from "react";
import { CAL_URL } from "@/lib/site";
import { setPlan } from "./homeStatus";

/* Trois lignes typographiques. Pas de cartes, pas de prix.
   La ligne s'ouvre, le prix reste au rendez-vous. */

const OFFRES = [
  {
    nom: "Étincelle",
    resume: "UN BIEN · UN FILM",
    detail:
      "Le film cinématique du bien, 45 à 60 secondes, à partir de 9 photos. Une traversée incluse. Livré en 72 h.",
  },
  {
    nom: "Flamme",
    resume: "FILM + RETOUCHE",
    detail:
      "Le film, plus la retouche complète des photos de l'annonce : lumière, ciels, verticales, colorimétrie. Le bien est cohérent partout.",
  },
  {
    nom: "Brasier",
    resume: "FILM + RETOUCHE + STAGING",
    detail:
      "Tout Flamme, plus le home staging virtuel des pièces vides — jusqu'au home staging progressif, meublé sous les yeux de l'acheteur.",
  },
] as const;

export default function Offres() {
  const [ouverte, setOuverte] = useState<number | null>(null);

  return (
    <section className="marge py-(--spacing-section)" onMouseEnter={() => setPlan("PLAN 06 · LES OFFRES")}>
      <h2 className="voix-mono mb-8" style={{ color: "var(--color-bronze)" }}>
        TROIS OFFRES · AUCUN PRIX ICI — ILS SE DONNENT DE VIVE VOIX
      </h2>

      <ul>
        {OFFRES.map((o, i) => {
          const est = ouverte === i;
          return (
            <li key={o.nom} className="filet">
              <button
                type="button"
                aria-expanded={est}
                aria-controls={`offre-${i}`}
                onClick={() => setOuverte(est ? null : i)}
                className="group flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6 text-left"
              >
                <span
                  className="voix-display transition-colors duration-200 group-hover:text-(--color-braise-vive)"
                  style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
                >
                  {o.nom}
                </span>
                <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
                  {o.resume}
                </span>
              </button>
              <div
                id={`offre-${i}`}
                className="grid transition-[grid-template-rows] duration-500"
                style={{
                  gridTemplateRows: est ? "1fr" : "0fr",
                  transitionTimingFunction: "var(--ease-pierre)",
                }}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-4 pb-8 md:max-w-2xl">
                    <p style={{ color: "var(--color-gris-pierre)" }}>{o.detail}</p>
                    <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
                      1ER FILM OFFERT · PRIX RÉVÉLÉ EN RENDEZ-VOUS
                    </p>
                    <a
                      href={CAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="voix-mono underline underline-offset-4"
                      style={{ color: "var(--color-pierre)" }}
                    >
                      Prendre rendez-vous
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
