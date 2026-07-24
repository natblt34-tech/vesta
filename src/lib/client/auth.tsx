"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabaseNavigateur } from "@/lib/supabase/client";
import type { User } from "./types";

/* Contexte d'authentification, adossé à Supabase Auth. Le contrat exposé
   aux pages (`useAuth`) est inchangé : user, pret, connexion, creerAcces,
   definirPrenom, deconnexion. Le rôle, l'agence et le prénom viennent de
   la table `profiles`. */

type AuthCtx = {
  user: User | null;
  pret: boolean;
  connexion: (email: string, mdp: string) => Promise<void>;
  creerAcces: (invite: string, email: string, mdp: string, nomAgence?: string) => Promise<void>;
  definirPrenom: (prenom: string) => Promise<void>;
  deconnexion: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

/* Compose l'utilisateur applicatif : identité Supabase + profil métier. */
async function chargerUtilisateur(): Promise<User | null> {
  const sb = supabaseNavigateur();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data: profil } = await sb
    .from("profiles")
    .select("role, prenom, agence_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  return {
    id: auth.user.id,
    email: auth.user.email ?? "",
    role: (profil?.role as User["role"]) ?? "client",
    agenceId: profil?.agence_id ?? undefined,
    prenom: profil?.prenom ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    let vivant = true;
    chargerUtilisateur().then((u) => {
      if (vivant) {
        setUser(u);
        setPret(true);
      }
    });
    /* Suit les changements de session (login/logout d'autres onglets). */
    const sb = supabaseNavigateur();
    const { data: sub } = sb.auth.onAuthStateChange(() => {
      chargerUtilisateur().then((u) => {
        if (vivant) setUser(u);
      });
    });
    return () => {
      vivant = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const connexion = useCallback(async (email: string, mdp: string) => {
    const sb = supabaseNavigateur();
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: mdp });
    if (error) throw new Error("Identifiants incorrects.");
    setUser(await chargerUtilisateur());
  }, []);

  const creerAcces = useCallback(
    async (invite: string, email: string, mdp: string, nomAgence?: string) => {
      /* L'inscription (création du compte + agence/rattachement + profil +
         consommation de l'invitation) se fait côté serveur, avec la clé
         secrète, de façon atomique. */
      const r = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite, email: email.trim(), motDePasse: mdp, nomAgence }),
      });
      const data = (await r.json()) as { erreur?: string };
      if (!r.ok) throw new Error(data.erreur ?? "Création impossible.");
      const sb = supabaseNavigateur();
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: mdp });
      if (error) throw new Error("Compte créé, mais connexion impossible.");
      setUser(await chargerUtilisateur());
    },
    [],
  );

  const definirPrenom = useCallback(async (prenom: string) => {
    const sb = supabaseNavigateur();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) throw new Error("Non connecté.");
    const propre = prenom.trim();
    if (!propre) throw new Error("Indiquez votre prénom.");
    const { error } = await sb.from("profiles").update({ prenom: propre }).eq("id", auth.user.id);
    if (error) throw new Error("Enregistrement impossible.");
    setUser(await chargerUtilisateur());
  }, []);

  const deconnexion = useCallback(async () => {
    await supabaseNavigateur().auth.signOut();
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
