"use client";

import type { ReactNode } from "react";
import { couleurStatus, LIBELLE_STATUS, type StatusJob } from "@/lib/client/types";

/* Éléments d'interface de l'espace client : pastilles de statut, tuiles
   de synthèse, chronologie de production, états vides. À la charte :
   filets hairline, aucun radius, accents braise rares. */

export function Pastille({ status }: { status: StatusJob }) {
  const c = couleurStatus(status);
  return (
    <span className="voix-mono inline-flex items-center gap-2" style={{ color: c }}>
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5" style={{ background: c }} />
      {LIBELLE_STATUS[status]}
    </span>
  );
}

export function TuileStat({
  label,
  valeur,
  accent,
}: {
  label: string;
  valeur: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 p-5" style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}>
      <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
        {label}
      </p>
      <p
        className="voix-display"
        style={{ fontSize: "2.2rem", lineHeight: 1, color: accent ? "var(--color-braise-vive)" : "var(--color-pierre)" }}
      >
        {valeur}
      </p>
    </div>
  );
}

/* La chronologie de production : les 5 étapes nominales. Un complément
   demandé suspend la course et s'affiche en alerte braise. */
const ETAPES: { s: StatusJob; court: string }[] = [
  { s: "recu", court: "REÇUE" },
  { s: "analyse", court: "ANALYSE" },
  { s: "en_production", court: "PRODUCTION" },
  { s: "controle_qualite", court: "CONTRÔLE QUALITÉ" },
  { s: "livre", court: "LIVRÉE" },
];

export function Chronologie({ status }: { status: StatusJob }) {
  const suspendu = status === "attention_requise";
  const index = suspendu ? 1 : ETAPES.findIndex((e) => e.s === status);

  return (
    <div className="flex flex-col gap-0">
      {ETAPES.map((e, i) => {
        const fait = i < index;
        const courant = i === index && !suspendu;
        const couleur = courant
          ? "var(--color-braise-vive)"
          : fait
            ? "var(--color-bronze)"
            : "var(--color-filet)";
        return (
          <div key={e.s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0"
                style={{
                  background: fait || courant ? couleur : "transparent",
                  border: `1px solid ${couleur}`,
                }}
              />
              {i < ETAPES.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="w-px flex-1"
                  style={{ background: fait ? "var(--color-bronze)" : "var(--color-filet)", minHeight: "1.1rem" }}
                />
              ) : null}
            </div>
            <p
              className="voix-mono pb-4"
              style={{ color: courant ? "var(--color-pierre)" : fait ? "var(--color-gris-pierre)" : "var(--color-filet)" }}
            >
              {e.court}
              {courant ? " · EN COURS" : ""}
            </p>
          </div>
        );
      })}
      {suspendu ? (
        <p
          className="voix-mono mt-1 px-3 py-2.5"
          style={{ borderLeft: "2px solid var(--color-braise)", color: "var(--color-braise-vive)", background: "var(--color-basalte-2)", lineHeight: 1.5 }}
        >
          COMPLÉMENT DEMANDÉ · LA PRODUCTION REPREND DÈS VOTRE RÉPONSE
        </p>
      ) : null}
    </div>
  );
}

export function EtatVide({ titre, action }: { titre: string; action?: ReactNode }) {
  return (
    <div
      className="flex flex-col items-center gap-5 px-6 py-16 text-center"
      style={{ border: "1px solid var(--color-filet)" }}
    >
      <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.7 }}>
        {titre}
      </p>
      {action}
    </div>
  );
}

export function EnTetePage({ titre, sous }: { titre: string; sous?: string }) {
  return (
    <header className="mb-8 sm:mb-10">
      <h1 className="voix-display" style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)", color: "var(--color-pierre)", lineHeight: 0.95 }}>
        {titre}
      </h1>
      {sous ? (
        <p className="voix-mono mt-3" style={{ color: "var(--color-gris-pierre)" }}>
          {sous}
        </p>
      ) : null}
    </header>
  );
}

export function BoutonBraise({
  children,
  ...props
}: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`voix-mono inline-flex items-center justify-center gap-3 px-6 py-3.5 transition-colors duration-200 hover:border-(--color-braise-vive) disabled:opacity-50 ${props.className ?? ""}`}
      style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)", ...props.style }}
    >
      <span className="braise-point" aria-hidden="true" />
      {children}
    </button>
  );
}
