"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";
import { useAuth } from "@/lib/client/auth";
import Champ from "./Champ";

/* Création des accès depuis le lien d'invitation reçu par email après
   souscription. Le jeton arrive en paramètre : /creer-acces?invite=XXX */
function Formulaire() {
  const router = useRouter();
  const params = useSearchParams();
  const invite = params.get("invite") ?? "demo-invite";
  const { creerAcces } = useAuth();
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  return (
    <div
      className="w-full max-w-sm p-8"
      style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
    >
      <p className="voix-mono mb-2" style={{ color: "var(--color-bronze)" }}>
        BIENVENUE CHEZ VESTA
      </p>
      <h1 className="voix-display mb-8" style={{ fontSize: "1.75rem", color: "var(--color-pierre)", lineHeight: 1 }}>
        Créez vos accès
      </h1>

      <form
        className="flex flex-col gap-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setErreur("");
          setEnCours(true);
          const data = new FormData(e.currentTarget);
          const mdp = String(data.get("password"));
          if (mdp.length < 6) {
            setErreur("Le mot de passe doit faire au moins 6 caractères.");
            setEnCours(false);
            return;
          }
          try {
            await creerAcces(invite, String(data.get("email")), mdp);
            router.replace("/espace");
          } catch (err) {
            setErreur(err instanceof Error ? err.message : "Erreur.");
            setEnCours(false);
          }
        }}
      >
        <Champ label="EMAIL PROFESSIONNEL" name="email" type="email" autoComplete="email" required />
        <Champ label="MOT DE PASSE" name="password" type="password" autoComplete="new-password" required />

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
          {enCours ? "Création…" : "Ouvrir mon espace"}
        </button>
      </form>

      <p className="voix-mono mt-6" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
        Déjà un compte ?{" "}
        <TransitionLink href="/connexion" className="underline underline-offset-2" style={{ color: "var(--color-pierre)" }}>
          Se connecter
        </TransitionLink>
        .
      </p>
    </div>
  );
}

export default function CreerAcces() {
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
      <Suspense fallback={null}>
        <Formulaire />
      </Suspense>
    </main>
  );
}
