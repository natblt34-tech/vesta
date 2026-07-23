"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";
import { useAuth } from "@/lib/client/auth";
import { backend } from "@/lib/client/backend";
import type { Job } from "@/lib/client/types";
import NouvelleDemande from "./NouvelleDemande";
import MesDemandes from "./MesDemandes";
import AideBulle from "./AideBulle";

type Onglet = "demandes" | "nouvelle";

export default function Espace() {
  const router = useRouter();
  const { user, pret, deconnexion } = useAuth();
  const [onglet, setOnglet] = useState<Onglet>("demandes");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [restants, setRestants] = useState<number | null>(null);

  const charger = useCallback(async () => {
    setJobs(await backend.mesJobs());
    setRestants(await backend.filmsRestants());
  }, []);

  useEffect(() => {
    if (!pret) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    if (user.role === "vesta") {
      router.replace("/vesta-studio");
      return;
    }
    charger();
  }, [pret, user, router, charger]);

  if (!pret || !user || user.role === "vesta") return null;

  return (
    <main className="marge min-h-svh py-14 sm:py-20" style={{ background: "var(--color-basalte)" }}>
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 sm:mb-14">
        <TransitionLink
          href="/"
          aria-label="vesta, retour à l'accueil"
          className="inline-flex items-baseline"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontStretch: "125%",
            fontSize: "1.25rem",
            color: "var(--color-pierre)",
            lineHeight: 1,
          }}
        >
          vesta
          <Etoile />
        </TransitionLink>

        <div className="flex items-center gap-5">
          <span className="voix-mono hidden sm:inline" style={{ color: "var(--color-gris-pierre)" }}>
            {user.agence || user.email}
          </span>
          <button
            type="button"
            onClick={() => {
              deconnexion();
              router.replace("/");
            }}
            className="voix-mono underline underline-offset-4"
            style={{ color: "var(--color-pierre)" }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* La formule : quota de films, jamais de montant. */}
      {user.formule && restants !== null ? (
        <p className="voix-mono mb-8" style={{ color: "var(--color-bronze)" }}>
          FORMULE {user.formule.nom.toUpperCase()} · {restants} FILM{restants > 1 ? "S" : ""} RESTANT
          {restants > 1 ? "S" : ""} CE MOIS-CI
        </p>
      ) : null}

      <nav className="mb-10 flex gap-2 sm:mb-12" role="tablist">
        {([
          ["demandes", "Mes demandes"],
          ["nouvelle", "Nouvelle demande"],
        ] as [Onglet, string][]).map(([cle, libelle]) => {
          const actif = onglet === cle;
          return (
            <button
              key={cle}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => setOnglet(cle)}
              className="voix-mono flex-1 px-4 py-3 transition-colors duration-200 sm:flex-none sm:px-5"
              style={{
                border: `1px solid ${actif ? "var(--color-braise)" : "var(--color-filet)"}`,
                color: actif ? "var(--color-pierre)" : "var(--color-gris-pierre)",
                background: actif ? "var(--color-basalte-2)" : "transparent",
              }}
            >
              {libelle}
            </button>
          );
        })}
      </nav>

      <div className="max-w-3xl">
        {onglet === "demandes" ? (
          <MesDemandes jobs={jobs} onMaj={charger} />
        ) : (
          <NouvelleDemande
            onEnvoye={async () => {
              await charger();
              setOnglet("demandes");
            }}
          />
        )}
      </div>

      <AideBulle />
    </main>
  );
}
