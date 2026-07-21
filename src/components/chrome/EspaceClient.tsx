"use client";

import { TransitionLink } from "./Transition";

/* Entrée discrète vers l'espace client : une silhouette tête-épaules en
   bas à gauche de l'accueil. Au survol, le libellé se déploie. */
export default function EspaceClient() {
  return (
    <TransitionLink
      href="/connexion"
      aria-label="Espace client"
      data-cursor
      className="group pointer-events-auto fixed bottom-6 left-[var(--spacing-marge)] z-90 inline-flex items-center overflow-hidden rounded-full py-2 pl-2 pr-2 transition-all duration-300 hover:pr-4"
      style={{
        border: "1px solid var(--color-filet)",
        background: "color-mix(in srgb, var(--color-basalte) 72%, transparent)",
        backdropFilter: "blur(8px)",
        color: "var(--color-gris-pierre)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className="h-5 w-5 shrink-0 transition-colors duration-300 group-hover:text-(--color-braise-vive)"
      >
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20 c0-3.9 3.1-6.6 7-6.6 s7 2.7 7 6.6" strokeLinecap="round" />
      </svg>
      <span
        className="voix-mono max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-[10rem]"
        style={{ color: "var(--color-pierre)" }}
      >
        Espace client
      </span>
    </TransitionLink>
  );
}
