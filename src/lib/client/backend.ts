"use client";

/* ————————————————————————————————————————————————————————————
   LE POINT DE BRANCHEMENT BACKEND.

   Tout le portail parle à cette interface `VestaBackend`, jamais à
   localStorage directement. Aujourd'hui : implémentation `mockBackend`
   (persistance navigateur). Le jour de la mise en ligne, il suffit
   d'écrire un `supabaseBackend` qui implémente la même interface
   (auth + table mandats + storage + Resend pour les emails) et de
   changer la seule ligne `export const backend = ...` en bas.
   Aucune page n'a à être modifiée.
   ———————————————————————————————————————————————————————————— */

import type { Mandat, NouveauMandat, User } from "./types";
import { notifier } from "./notify";

export interface VestaBackend {
  // Auth
  utilisateurCourant(): User | null;
  connexion(email: string, motDePasse: string): Promise<User>;
  creerAcces(invite: string, email: string, motDePasse: string): Promise<User>;
  deconnexion(): void;

  // Mandats (côté client)
  mesMandats(): Promise<Mandat[]>;
  creerMandat(m: NouveauMandat): Promise<Mandat>;

  // Mandats (côté studio Vesta)
  tousLesMandats(): Promise<Mandat[]>;
  deposerProduction(mandatId: string, url: string, nom: string): Promise<Mandat>;

  demanderAide(message: string): Promise<void>;
}

/* —————————————————— Implémentation mock (démo locale) —————————————————— */

const CLE_USERS = "vesta-users";
const CLE_MANDATS = "vesta-mandats";
const CLE_SESSION = "vesta-session";

type CompteStocke = User & { motDePasse: string };

function lire<T>(cle: string, defaut: T): T {
  if (typeof window === "undefined") return defaut;
  try {
    const v = window.localStorage.getItem(cle);
    return v ? (JSON.parse(v) as T) : defaut;
  } catch {
    return defaut;
  }
}

function ecrire(cle: string, valeur: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(cle, JSON.stringify(valeur));
}

function id() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* Comptes de démonstration semés au premier chargement. */
function semer() {
  const users = lire<CompteStocke[]>(CLE_USERS, []);
  if (users.length === 0) {
    ecrire(CLE_USERS, [
      { id: "vesta", email: "studio@vesta", role: "vesta", motDePasse: "vesta" },
      { id: "demo", email: "agence@demo", role: "client", agence: "Agence Démo", motDePasse: "demo" },
    ]);
  }
}

export const mockBackend: VestaBackend = {
  utilisateurCourant() {
    return lire<User | null>(CLE_SESSION, null);
  },

  async connexion(email, motDePasse) {
    semer();
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.motDePasse === motDePasse);
    if (!u) throw new Error("Identifiants incorrects.");
    const { motDePasse: _mdp, ...user } = u;
    void _mdp;
    ecrire(CLE_SESSION, user);
    return user;
  },

  async creerAcces(invite, email, motDePasse) {
    semer();
    /* En prod : le lien d'invitation porte un jeton signé validé côté
       serveur. En mock : tout jeton non vide est accepté. */
    if (!invite) throw new Error("Lien d'invitation invalide.");
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Un compte existe déjà pour cet email.");
    }
    const user: User = { id: id(), email, role: "client" };
    ecrire(CLE_USERS, [...users, { ...user, motDePasse }]);
    ecrire(CLE_SESSION, user);
    return user;
  },

  deconnexion() {
    if (typeof window !== "undefined") window.localStorage.removeItem(CLE_SESSION);
  },

  async mesMandats() {
    const u = this.utilisateurCourant();
    if (!u) return [];
    const tous = lire<Mandat[]>(CLE_MANDATS, []);
    return tous.filter((m) => m.clientId === u.id).sort((a, b) => b.creeLe - a.creeLe);
  },

  async creerMandat(m) {
    const u = this.utilisateurCourant();
    if (!u) throw new Error("Non connecté.");
    const mandat: Mandat = {
      id: id(),
      clientId: u.id,
      clientEmail: u.email,
      nom: m.nom,
      description: m.description,
      photos: m.photos,
      connexions: m.connexions,
      production: null,
      statut: "recu",
      creeLe: Date.now(),
    };
    const tous = lire<Mandat[]>(CLE_MANDATS, []);
    ecrire(CLE_MANDATS, [mandat, ...tous]);
    /* Notification : nouvelle demande -> studio Vesta. */
    await notifier({
      type: "nouveau-mandat",
      destinataire: "studio@vesta",
      sujet: `Nouvelle demande : ${mandat.nom}`,
      corps: `${u.email} a déposé un nouveau mandat « ${mandat.nom} » (${mandat.photos.length} photos, ${mandat.connexions.length} connexions).`,
    });
    return mandat;
  },

  async tousLesMandats() {
    return lire<Mandat[]>(CLE_MANDATS, []).sort((a, b) => b.creeLe - a.creeLe);
  },

  async deposerProduction(mandatId, url, nom) {
    const tous = lire<Mandat[]>(CLE_MANDATS, []);
    const i = tous.findIndex((m) => m.id === mandatId);
    if (i < 0) throw new Error("Mandat introuvable.");
    tous[i] = {
      ...tous[i],
      production: { url, nom, deposeeLe: Date.now() },
      statut: "livre",
    };
    ecrire(CLE_MANDATS, tous);
    /* Notification : production déposée -> client. */
    await notifier({
      type: "production-livree",
      destinataire: tous[i].clientEmail,
      sujet: `Votre film est prêt : ${tous[i].nom}`,
      corps: `La vidéo du mandat « ${tous[i].nom} » est disponible dans votre espace client.`,
    });
    return tous[i];
  },

  async demanderAide(message) {
    const u = this.utilisateurCourant();
    await notifier({
      type: "aide",
      destinataire: "studio@vesta",
      sujet: "Demande d'aide espace client",
      corps: `${u?.email ?? "un visiteur"} : ${message}`,
    });
  },
};

/* ⤵ La seule ligne à changer le jour de la mise en ligne. */
export const backend: VestaBackend = mockBackend;
