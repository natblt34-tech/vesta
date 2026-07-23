"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { useAuth } from "@/lib/client/auth";
import { backend } from "@/lib/client/backend";
import { media } from "@/lib/media";
import { resumeFormule, type Invitation } from "@/lib/client/types";
import CoquilleConnexion, { ChampMotDePasse } from "@/components/ui/sign-in";
import Champ from "./Champ";

/* Création des accès depuis un lien d'invitation : /creer-acces?invite=XXX
   Deux cas :
   - invitation Vesta (fondateur) : le client nomme son agence, ce qui
     crée le workspace dédié ;
   - invitation d'agence (membre) : le collègue rejoint automatiquement
     le workspace de son agence. */
function Formulaire() {
  const router = useRouter();
  const params = useSearchParams();
  const invite = params.get("invite") ?? "demo-invite";
  const { creerAcces } = useAuth();
  const [info, setInfo] = useState<Invitation | null | "chargement">("chargement");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    backend.infoInvitation(invite).then(setInfo);
  }, [invite]);

  if (info === "chargement") return null;

  if (info === null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="voix-mono" style={{ color: "var(--color-braise-vive)", lineHeight: 1.6 }}>
          CE LIEN D&apos;INVITATION EST INVALIDE OU A DÉJÀ ÉTÉ UTILISÉ.
        </p>
        <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
          Rapprochez-vous de votre agence ou du studio.
        </p>
      </div>
    );
  }

  const fondateur = info.type === "fondateur";

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
          await creerAcces(
            invite,
            String(data.get("email")),
            mdp,
            fondateur ? String(data.get("agence")) : undefined,
          );
          router.replace("/espace");
        } catch (err) {
          setErreur(err instanceof Error ? err.message : "Erreur.");
          setEnCours(false);
        }
      }}
    >
      {fondateur ? (
        <>
          <p className="voix-mono -mt-1" style={{ color: "var(--color-bronze)", lineHeight: 1.6 }}>
            FORMULE {info.formule.nom.toUpperCase()} · {resumeFormule(info.formule)}
          </p>
          <Champ
            label="NOM DE VOTRE AGENCE"
            name="agence"
            placeholder="Ex : Agence Sud Immobilier"
            autoComplete="organization"
            required
          />
          <p className="voix-mono -mt-2" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
            VOUS CRÉEZ L&apos;ESPACE DE VOTRE AGENCE. VOUS POURREZ ENSUITE Y INVITER VOS COLLÈGUES.
          </p>
        </>
      ) : (
        <p className="voix-mono" style={{ color: "var(--color-bronze)", lineHeight: 1.6 }}>
          VOUS REJOIGNEZ L&apos;ESPACE DE {info.agenceNom.toUpperCase()}.
        </p>
      )}

      <Champ
        label="EMAIL PROFESSIONNEL"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={fondateur ? (info.email ?? "") : ""}
        required
      />
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
        {enCours ? "Création…" : fondateur ? "Créer l'espace de mon agence" : "Rejoindre mon agence"}
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
