"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { backend } from "./backend";
import type { User } from "./types";

/* Contexte d'authentification. S'appuie sur `backend` (mock aujourd'hui,
   Supabase Auth demain) — l'interface consommée par l'app ne change pas. */

type AuthCtx = {
  user: User | null;
  pret: boolean;
  connexion: (email: string, mdp: string) => Promise<void>;
  creerAcces: (invite: string, email: string, mdp: string, nomAgence?: string) => Promise<void>;
  definirPrenom: (prenom: string) => Promise<void>;
  deconnexion: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setUser(backend.utilisateurCourant());
    setPret(true);
  }, []);

  const connexion = useCallback(async (email: string, mdp: string) => {
    setUser(await backend.connexion(email, mdp));
  }, []);

  const creerAcces = useCallback(async (invite: string, email: string, mdp: string, nomAgence?: string) => {
    setUser(await backend.creerAcces(invite, email, mdp, nomAgence));
  }, []);

  const definirPrenom = useCallback(async (prenom: string) => {
    setUser(await backend.definirPrenom(prenom));
  }, []);

  const deconnexion = useCallback(() => {
    backend.deconnexion();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, pret, connexion, creerAcces, definirPrenom, deconnexion }),
    [user, pret, connexion, creerAcces, definirPrenom, deconnexion],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth hors AuthProvider");
  return c;
}
