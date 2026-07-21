"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";
import { useAuth } from "@/lib/client/auth";
import { backend } from "@/lib/client/backend";
import type { Mandat } from "@/lib/client/types";
import NouvelleDemande from "./NouvelleDemande";
import MesProductions from "./MesProductions";
import AideBulle from "./AideBulle";

type Onglet = "demande" | "productions";

export default function Espace() {
  const router = useRouter();
  const { user, pret, deconnexion } = useAuth();
  const [onglet, setOnglet] = useState<Onglet>("productions");
  const [mandats, setMandats] = useState<Mandat[]>([]);

  const charger = useCallback(async () => {
    setMandats(await backend.mesMandats());
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
    <main className="marge min-h-svh py-20" style={{ background: "var(--color-basalte)" }}>
      <header className="mb-14 flex flex-wrap items-center justify-between gap-4">
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
          <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
            {user.email}
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

      <nav className="mb-12 flex gap-2" role="tablist">
        {([
          ["productions", "Mes productions"],
          ["demande", "Nouvelle demande"],
        ] as [Onglet, string][]).map(([cle, libelle]) => {
          const actif = onglet === cle;
          return (
            <button
              key={cle}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => setOnglet(cle)}
              className="voix-mono px-5 py-3 transition-colors duration-200"
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
        {onglet === "productions" ? (
          <MesProductions mandats={mandats} />
        ) : (
          <NouvelleDemande
            onEnvoye={async () => {
              await charger();
              setOnglet("productions");
            }}
          />
        )}
      </div>

      <AideBulle />
    </main>
  );
}
