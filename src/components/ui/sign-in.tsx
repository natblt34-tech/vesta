"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";

/* Coquille de l'espace connexion — adaptation Vesta du composant SignInPage :
   split-screen formulaire / image pleine hauteur, révélations échelonnées.
   À la charte : filets hairline, aucun radius, pas de verre dépoli ; les
   entrées se font par masque + poids (pas de fade-in-up) ; l'accent reste
   la braise. Pas d'OAuth ni de témoignages : les comptes sont créés par
   Vesta, l'image de droite montre un film réellement livré. */

function Delai({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="anim-connexion" style={{ "--delai": `${n * 0.09}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}

/* Champ mot de passe avec œil (SVG inline, convention du site). */
export function ChampMotDePasse({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="flex flex-col gap-2">
      <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className="w-full bg-transparent py-3 pl-3 pr-12 outline-none focus-visible:border-(--color-bronze)"
          style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center"
          style={{ color: "var(--color-gris-pierre)" }}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c5 0 8.6 4 9.8 6.3a1.5 1.5 0 0 1 0 1.4 13.2 13.2 0 0 1-2.6 3.3M6.6 6.7C4.4 8.1 2.9 10 2.2 11.3a1.5 1.5 0 0 0 0 1.4C3.4 15 7 19 12 19c1.2 0 2.3-.2 3.3-.6" strokeLinecap="round" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2.2 11.3C3.4 9 7 5 12 5s8.6 4 9.8 6.3a1.5 1.5 0 0 1 0 1.4C20.6 15 17 19 12 19s-8.6-4-9.8-6.3a1.5 1.5 0 0 1 0-1.4Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}

export default function CoquilleConnexion({
  surTitre,
  titre,
  heroSrc,
  heroPosition,
  heroLegende,
  children,
  pied,
}: {
  surTitre: string;
  titre: string;
  heroSrc: string;
  heroPosition?: string;
  heroLegende?: string;
  children: ReactNode;
  pied?: ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col md:flex-row" style={{ background: "var(--color-basalte)" }}>
      {/* Colonne formulaire */}
      <section className="relative flex flex-1 flex-col px-6 py-8 sm:px-10">
        <Delai n={0}>
          <TransitionLink
            href="/"
            aria-label="vesta, retour à l'accueil"
            className="inline-flex items-baseline"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontStretch: "125%",
              fontSize: "1.4rem",
              color: "var(--color-pierre)",
              lineHeight: 1,
            }}
          >
            vesta
            <Etoile />
          </TransitionLink>
        </Delai>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <Delai n={1}>
              <p className="voix-mono mb-3" style={{ color: "var(--color-bronze)" }}>
                {surTitre}
              </p>
            </Delai>
            <Delai n={2}>
              <h1
                className="voix-display mb-10"
                style={{ fontSize: "clamp(2.1rem, 5vw, 2.75rem)", color: "var(--color-pierre)", lineHeight: 0.95 }}
              >
                {titre}
              </h1>
            </Delai>
            <Delai n={3}>{children}</Delai>
            {pied ? <Delai n={4}>{pied}</Delai> : null}
          </div>
        </div>
      </section>

      {/* Colonne image : un film réellement livré, plein cadre. */}
      <section className="anim-connexion-hero relative hidden flex-1 md:block">
        <img
          src={heroSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: heroPosition ?? "center" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--color-basalte), rgba(18,21,26,0.12) 34%, rgba(18,21,26,0) 60%), linear-gradient(rgba(18,21,26,0) 55%, rgba(18,21,26,0.78))",
          }}
        />
        {heroLegende ? (
          <p className="voix-mono absolute bottom-8 left-8" style={{ color: "var(--color-pierre)" }}>
            {heroLegende}
          </p>
        ) : null}
      </section>
    </main>
  );
}
