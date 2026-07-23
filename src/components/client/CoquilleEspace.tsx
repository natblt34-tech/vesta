"use client";

import type { ReactNode } from "react";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";

/* La coquille applicative de l'espace client et du studio : sidebar
   fixe sur desktop, barre d'onglets basse sur mobile (les agents sont
   sur téléphone). Même monde que le site : basalte, filets, braise. */

export type ElementNav = {
  id: string;
  libelle: string;
  icone: ReactNode;
  /* Point braise : quelque chose attend une action. */
  alerte?: boolean;
};

export const Ico = {
  apercu: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="7" height="7" />
      <rect x="13.5" y="3.5" width="7" height="7" />
      <rect x="3.5" y="13.5" width="7" height="7" />
      <rect x="13.5" y="13.5" width="7" height="7" />
    </svg>
  ),
  demandes: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 12h16M4 18h9" strokeLinecap="round" />
    </svg>
  ),
  nouvelle: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  comptes: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8.2" r="3.1" />
      <path d="M3.6 19c.8-2.9 2.8-4.4 5.4-4.4s4.6 1.5 5.4 4.4" strokeLinecap="round" />
      <path d="M15.2 5.6a3.1 3.1 0 1 1 .4 5.9M16.8 14.9c1.9.5 3.2 1.9 3.8 4.1" strokeLinecap="round" />
    </svg>
  ),
};

function Alerte() {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
      style={{ background: "var(--color-braise-vive)" }}
    />
  );
}

export default function CoquilleEspace({
  marque,
  nav,
  actif,
  onChange,
  agence,
  email,
  onDeconnexion,
  children,
}: {
  marque: string;
  nav: ElementNav[];
  actif: string;
  onChange: (id: string) => void;
  agence?: string;
  email: string;
  onDeconnexion: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh" style={{ background: "var(--color-basalte)" }}>
      {/* ——— Sidebar desktop ——— */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col md:flex"
        style={{ background: "var(--color-basalte-2)", borderRight: "1px solid var(--color-filet)" }}
      >
        <div className="px-6 pt-7">
          <TransitionLink
            href="/"
            aria-label="vesta, retour à l'accueil"
            className="inline-flex items-baseline"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontStretch: "125%",
              fontSize: "1.3rem",
              color: "var(--color-pierre)",
              lineHeight: 1,
            }}
          >
            vesta
            <Etoile />
          </TransitionLink>
          <p className="voix-mono mt-2" style={{ color: "var(--color-bronze)" }}>
            {marque}
          </p>
        </div>

        <nav className="mt-9 flex flex-col" aria-label="Navigation de l'espace">
          {nav.map((n) => {
            const estActif = actif === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onChange(n.id)}
                aria-current={estActif ? "page" : undefined}
                className="voix-mono flex items-center gap-3.5 px-6 py-3.5 text-left transition-colors duration-200"
                style={{
                  color: estActif ? "var(--color-pierre)" : "var(--color-gris-pierre)",
                  background: estActif ? "var(--color-basalte)" : "transparent",
                  boxShadow: estActif ? "inset 2px 0 0 var(--color-braise)" : "none",
                }}
              >
                <span className="relative" style={{ color: estActif ? "var(--color-braise-vive)" : "currentColor" }}>
                  {n.icone}
                  {n.alerte ? <Alerte /> : null}
                </span>
                {n.libelle}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-4 px-6 pb-7">
          <TransitionLink
            href="/"
            className="voix-mono underline underline-offset-4"
            style={{ color: "var(--color-gris-pierre)" }}
          >
            ← Retour au site
          </TransitionLink>
          <div className="pt-4" style={{ borderTop: "1px solid var(--color-filet)" }}>
            {agence ? (
              <p className="truncate" style={{ color: "var(--color-pierre)", fontSize: "0.9rem" }}>
                {agence}
              </p>
            ) : null}
            <p className="voix-mono mt-1 truncate" style={{ color: "var(--color-gris-pierre)" }}>
              {email}
            </p>
            <button
              type="button"
              onClick={onDeconnexion}
              className="voix-mono mt-3 underline underline-offset-4"
              style={{ color: "var(--color-pierre)" }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* ——— Barre haute mobile ——— */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 md:hidden"
        style={{ background: "var(--color-basalte-2)", borderBottom: "1px solid var(--color-filet)" }}
      >
        <TransitionLink
          href="/"
          aria-label="vesta, retour à l'accueil"
          className="inline-flex items-baseline"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontStretch: "125%",
            fontSize: "1.15rem",
            color: "var(--color-pierre)",
            lineHeight: 1,
          }}
        >
          vesta
          <Etoile />
        </TransitionLink>
        <div className="flex items-center gap-4">
          <span className="voix-mono max-w-40 truncate" style={{ color: "var(--color-gris-pierre)" }}>
            {agence || email}
          </span>
          <button
            type="button"
            onClick={onDeconnexion}
            aria-label="Déconnexion"
            className="flex h-8 w-8 items-center justify-center"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-gris-pierre)" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 5H6v14h8M10 12h10m0 0-3.2-3.2M20 12l-3.2 3.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* ——— Contenu ——— */}
      <main className="px-5 pb-28 pt-8 sm:px-8 md:ml-60 md:px-12 md:pb-16 md:pt-12">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>

      {/* ——— Barre d'onglets basse mobile ——— */}
      <nav
        aria-label="Navigation de l'espace"
        className="fixed inset-x-0 bottom-0 z-40 grid md:hidden"
        style={{
          gridTemplateColumns: `repeat(${nav.length}, 1fr)`,
          background: "var(--color-basalte-2)",
          borderTop: "1px solid var(--color-filet)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {nav.map((n) => {
          const estActif = actif === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onChange(n.id)}
              aria-current={estActif ? "page" : undefined}
              className="flex flex-col items-center gap-1.5 py-3"
              style={{ color: estActif ? "var(--color-braise-vive)" : "var(--color-gris-pierre)" }}
            >
              <span className="relative">
                {n.icone}
                {n.alerte ? <Alerte /> : null}
              </span>
              <span className="voix-mono" style={{ fontSize: "0.5rem", color: estActif ? "var(--color-pierre)" : "inherit" }}>
                {n.libelle}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
