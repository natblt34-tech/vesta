"use client";

import { useState } from "react";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";

/* Fenêtre de connexion à l'espace client.
   NOTE : l'authentification réelle nécessite un backend (voir NOTES.md).
   Cette page est l'entrée du parcours ; le formulaire est branché sur
   un état local en attendant le socle serveur. */
export default function Connexion() {
  const [envoye, setEnvoye] = useState(false);

  return (
    <main
      className="flex min-h-svh flex-col items-center justify-center px-6"
      style={{ background: "var(--color-basalte)" }}
    >
      <TransitionLink
        href="/"
        aria-label="vesta, retour à l'accueil"
        className="mb-12 inline-flex items-baseline"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontStretch: "125%",
          fontSize: "1.5rem",
          color: "var(--color-pierre)",
          lineHeight: 1,
        }}
      >
        vesta
        <Etoile />
      </TransitionLink>

      <div
        className="w-full max-w-sm p-8"
        style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
      >
        <p className="voix-mono mb-2" style={{ color: "var(--color-bronze)" }}>
          ESPACE CLIENT
        </p>
        <h1
          className="voix-display mb-8"
          style={{ fontSize: "1.75rem", color: "var(--color-pierre)", lineHeight: 1 }}
        >
          Connexion
        </h1>

        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setEnvoye(true);
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              EMAIL
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full bg-transparent px-3 py-3 outline-none"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              MOT DE PASSE
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full bg-transparent px-3 py-3 outline-none"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            />
          </label>

          <button
            type="submit"
            className="voix-mono mt-2 inline-flex items-center justify-center gap-3 px-6 py-4 transition-colors duration-200 hover:border-(--color-braise-vive)"
            style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
          >
            <span className="braise-point" aria-hidden="true" />
            Se connecter
          </button>
        </form>

        {envoye ? (
          <p className="voix-mono mt-6" style={{ color: "var(--color-bronze)", lineHeight: 1.6 }}>
            L&apos;espace client est en cours d&apos;activation. Vous serez averti par
            email dès son ouverture.
          </p>
        ) : (
          <p className="voix-mono mt-6" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
            Vous venez de souscrire ? Utilisez le lien reçu par email pour créer
            vos accès.
          </p>
        )}
      </div>

      <TransitionLink
        href="/"
        className="voix-mono mt-10 underline underline-offset-4"
        style={{ color: "var(--color-gris-pierre)" }}
      >
        ← Retour au site
      </TransitionLink>
    </main>
  );
}
