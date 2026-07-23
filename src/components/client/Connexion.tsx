"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { useAuth } from "@/lib/client/auth";
import { media } from "@/lib/media";
import CoquilleConnexion, { ChampMotDePasse } from "@/components/ui/sign-in";
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
    <CoquilleConnexion
      surTitre="ESPACE CLIENT"
      titre="Connexion"
      heroSrc={media("connexion-hero.webp")}
      heroPosition="center 55%"
      pied={
        <div className="mt-8 flex flex-col gap-3">
          <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
            Vous venez de recevoir votre invitation ?{" "}
            <TransitionLink
              href="/creer-acces"
              className="underline underline-offset-2"
              style={{ color: "var(--color-pierre)" }}
            >
              Créez vos accès
            </TransitionLink>
            .
          </p>
          <TransitionLink
            href="/"
            className="voix-mono underline underline-offset-4"
            style={{ color: "var(--color-gris-pierre)" }}
          >
            ← Retour au site
          </TransitionLink>
          <p className="voix-mono" style={{ color: "var(--color-filet)", lineHeight: 1.6 }}>
            Démo : agence@demo / demo · studio@vesta / vesta
          </p>
        </div>
      }
    >
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
        <ChampMotDePasse label="MOT DE PASSE" name="password" autoComplete="current-password" required />

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
    </CoquilleConnexion>
  );
}
