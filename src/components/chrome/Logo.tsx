"use client";

import { TransitionLink } from "./Transition";

/* Le logo : vesta en minuscules, l'étoile braise en guise d'astérisque.
   L'astérisque est LE signe de la marque : il revient dans les punchlines. */

export function Etoile({ taille = "0.9em" }: { taille?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        color: "var(--color-braise-vive)",
        fontSize: taille,
        lineHeight: 0,
        display: "inline-block",
        transform: "translateY(-0.08em)",
        textShadow: "0 0 10px color-mix(in srgb, var(--color-braise-vive) 55%, transparent)",
      }}
    >
      *
    </span>
  );
}

export default function Logo() {
  return (
    <TransitionLink
      href="/"
      aria-label="vesta, retour à l'accueil"
      className="pointer-events-auto inline-flex items-baseline"
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontStretch: "125%",
        letterSpacing: "-0.01em",
        fontSize: "1.125rem",
        color: "var(--page-fg)",
        lineHeight: 1,
      }}
    >
      vesta
      <Etoile />
    </TransitionLink>
  );
}
