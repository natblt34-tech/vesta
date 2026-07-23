"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { useAuth } from "@/lib/client/auth";
import { media } from "@/lib/media";
import CoquilleConnexion, { ChampMotDePasse } from "@/components/ui/sign-in";
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
      <ChampMotDePasse label="MOT DE PASSE" name="password" autoComplete="new-password" required />

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
  );
}

export default function CreerAcces() {
  return (
    <CoquilleConnexion
      surTitre="BIENVENUE CHEZ VESTA"
      titre="Créez vos accès"
      heroSrc={media("archi-salon.webp")}
      heroPosition="center 50%"
      heroLegende="FILM LIVRÉ · MAISON D'ARCHITECTE · 32 S"
      pied={
        <p className="voix-mono mt-8" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
          Déjà un compte ?{" "}
          <TransitionLink href="/connexion" className="underline underline-offset-2" style={{ color: "var(--color-pierre)" }}>
            Se connecter
          </TransitionLink>
          .
        </p>
      }
    >
      <Suspense fallback={null}>
        <Formulaire />
      </Suspense>
    </CoquilleConnexion>
  );
}
