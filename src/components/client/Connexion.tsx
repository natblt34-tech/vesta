"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";
import { useAuth } from "@/lib/client/auth";
import Champ from "./Champ";

/* Fenêtre de connexion. Branchée sur le backend (mock aujourd'hui). */
export default function Connexion() {
  const router = useRouter();
  const { user, pret, connexion } = useAuth();
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (pret && user) router.replace(user.role === "vesta" ? "/vesta-studio" : "/espace");
  }, [pret, user, router]);

  return (
    <main
      className="flex min-h-svh flex-col items-center justify-center px-6 py-24"
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
        <h1 className="voix-display mb-8" style={{ fontSize: "1.75rem", color: "var(--color-pierre)", lineHeight: 1 }}>
          Connexion
        </h1>

        <form
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setErreur("");
            setEnCours(true);
            const data = new FormData(e.currentTarget);
            try {
              await connexion(String(data.get("email")), String(data.get("password")));
              router.replace("/espace");
            } catch (err) {
              setErreur(err instanceof Error ? err.message : "Erreur.");
              setEnCours(false);
            }
          }}
        >
          <Champ label="EMAIL" name="email" type="email" autoComplete="email" required />
          <Champ label="MOT DE PASSE" name="password" type="password" autoComplete="current-password" required />

          {erreur ? (
            <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
              {erreur}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={enCours}
            className="voix-mono mt-2 inline-flex items-center justify-center gap-3 px-6 py-4 transition-colors duration-200 hover:border-(--color-braise-vive) disabled:opacity-60"
            style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
          >
            <span className="braise-point" aria-hidden="true" />
            {enCours ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="voix-mono mt-6" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
          Vous venez de souscrire ?{" "}
          <TransitionLink
            href="/creer-acces"
            className="underline underline-offset-2"
            style={{ color: "var(--color-pierre)" }}
          >
            Créez vos accès
          </TransitionLink>
          .
        </p>

        <p className="voix-mono mt-4" style={{ color: "var(--color-filet)", lineHeight: 1.6 }}>
          Démo : agence@demo / demo — studio@vesta / vesta
        </p>
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
