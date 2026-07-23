"use client";

/* ————————————————————————————————————————————————————————————
   LE POINT DE BRANCHEMENT BACKEND.

   Tout le portail parle à cette interface `VestaBackend`, jamais à
   localStorage directement. Aujourd'hui : implémentation `mockBackend`
   (persistance navigateur). Le jour de la mise en ligne, un adaptateur
   réel (Supabase ou petit serveur Node) implémente la même interface
   et on change la seule ligne `export const backend = ...` en bas.

   Les jobs sont stockés AU FORMAT EXACT du contrat pipeline
   (voir PIPELINE.md) : l'API REST les servira tels quels.
   ———————————————————————————————————————————————————————————— */

import type {
  CompteClient,
  Deliverable,
  Formule,
  Job,
  JobPhoto,
  NouvelleDemandeData,
  StatusJob,
  User,
} from "./types";
import { notifier } from "./notify";

export interface VestaBackend {
  // Auth — comptes créés par Vesta, pas d'inscription libre.
  utilisateurCourant(): User | null;
  connexion(email: string, motDePasse: string): Promise<User>;
  creerAcces(invite: string, email: string, motDePasse: string): Promise<User>;
  deconnexion(): void;

  // Côté client
  mesJobs(): Promise<Job[]>;
  creerJob(d: NouvelleDemandeData): Promise<Job>;
  repondreComplement(jobId: string, texte: string, photos: JobPhoto[]): Promise<Job>;
  /* Films restants ce mois-ci pour la formule du compte (null : sans formule). */
  filmsRestants(): Promise<number | null>;

  // Côté studio Vesta (admin)
  tousLesJobs(): Promise<Job[]>;
  changerStatus(jobId: string, status: StatusJob, message?: string): Promise<Job>;
  deposerLivrable(jobId: string, livrable: Deliverable): Promise<Job>;
  renvoyerEmailLivraison(jobId: string): Promise<void>;
  comptesClients(): Promise<CompteClient[]>;
  /* Crée le compte côté Vesta et renvoie le lien d'invitation à envoyer. */
  creerCompteClient(email: string, agence: string, formule: Formule): Promise<{ lienInvitation: string }>;

  demanderAide(message: string): Promise<void>;
}

/* —————————————————— Implémentation mock (démo locale) —————————————————— */

const CLE_USERS = "vesta-users-v2";
const CLE_JOBS = "vesta-jobs";
const CLE_SESSION = "vesta-session-v2";
const CLE_INVITES = "vesta-invites";

type CompteStocke = User & { motDePasse: string };
type InviteStockee = { jeton: string; email: string; agence: string; formule: Formule };

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

function id(prefixe: string) {
  return `${prefixe}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function memeMois(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/* Comptes de démonstration semés au premier chargement. */
function semer() {
  const users = lire<CompteStocke[]>(CLE_USERS, []);
  if (users.length === 0) {
    ecrire(CLE_USERS, [
      { id: "vesta", email: "studio@vesta", role: "vesta", motDePasse: "vesta" },
      {
        id: "demo",
        email: "agence@demo",
        role: "client",
        agence: "Agence Démo",
        formule: { nom: "Essentiel", quotaFilmsMois: 4 },
        motDePasse: "demo",
      },
    ]);
  }
}

function jobs(): Job[] {
  return lire<Job[]>(CLE_JOBS, []);
}

function trouverJob(jobId: string): { tous: Job[]; i: number } {
  const tous = jobs();
  const i = tous.findIndex((j) => j.id === jobId);
  if (i < 0) throw new Error("Demande introuvable.");
  return { tous, i };
}

function lienEspace(): string {
  if (typeof window === "undefined") return "/espace";
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${window.location.origin}${base}/espace/`;
}

async function emailLivraison(job: Job) {
  await notifier({
    type: "livraison",
    destinataire: job.client.email,
    sujet: `Votre film est prêt : ${job.property.title}`,
    corps: `Le film de « ${job.property.title} » (${job.property.city}) est disponible dans votre espace client : ${lienEspace()}`,
  });
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
    if (!invite) throw new Error("Lien d'invitation invalide.");
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Un compte existe déjà pour cet email.");
    }
    /* En prod : jeton signé validé côté serveur. En mock : l'invitation
       créée par l'admin porte l'agence et la formule ; à défaut
       (« demo-invite »), compte de démonstration. */
    const invites = lire<InviteStockee[]>(CLE_INVITES, []);
    const inv = invites.find((x) => x.jeton === invite);
    const user: User = inv
      ? { id: id("cli"), email, role: "client", agence: inv.agence, formule: inv.formule }
      : { id: id("cli"), email, role: "client", agence: email.split("@")[0], formule: { nom: "Essentiel", quotaFilmsMois: 4 } };
    if (inv) ecrire(CLE_INVITES, invites.filter((x) => x.jeton !== invite));
    ecrire(CLE_USERS, [...users, { ...user, motDePasse }]);
    ecrire(CLE_SESSION, user);
    return user;
  },

  deconnexion() {
    if (typeof window !== "undefined") window.localStorage.removeItem(CLE_SESSION);
  },

  /* ——— Côté client ——— */

  async mesJobs() {
    const u = this.utilisateurCourant();
    if (!u) return [];
    return jobs()
      .filter((j) => j.client.id === u.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async creerJob(d) {
    const u = this.utilisateurCourant();
    if (!u) throw new Error("Non connecté.");
    const job: Job = {
      id: id("job"),
      createdAt: new Date().toISOString(),
      client: { id: u.id, agence: u.agence ?? "", email: u.email },
      property: d.property,
      photos: d.photos,
      floorplanUrl: d.floorplanUrl,
      agencement: d.agencement,
      options: d.options,
      status: "recu",
      statusMessage: null,
      deliverables: [],
      reponses: [],
    };
    ecrire(CLE_JOBS, [job, ...jobs()]);
    await notifier({
      type: "nouvelle-demande",
      destinataire: "studio@vesta",
      sujet: `Nouvelle demande : ${job.property.title} (${job.property.city})`,
      corps: `${u.email} a déposé « ${job.property.title} » : ${job.photos.length} photos, formats ${job.options.formats.join(" + ")}, staging ${job.options.staging.length ? job.options.staging.map((s) => s.room).join(", ") : "non"}.`,
    });
    return job;
  },

  async repondreComplement(jobId, texte, photos) {
    const u = this.utilisateurCourant();
    if (!u) throw new Error("Non connecté.");
    const { tous, i } = trouverJob(jobId);
    tous[i] = {
      ...tous[i],
      reponses: [...tous[i].reponses, { texte, photos, le: new Date().toISOString() }],
      /* Le complément fourni, la demande repart en analyse. */
      status: "analyse",
      statusMessage: null,
    };
    ecrire(CLE_JOBS, tous);
    await notifier({
      type: "complement-reponse",
      destinataire: "studio@vesta",
      sujet: `Complément reçu : ${tous[i].property.title}`,
      corps: `${u.email} a répondu (${photos.length} photo(s) jointe(s)) : ${texte}`,
    });
    return tous[i];
  },

  async filmsRestants() {
    const u = this.utilisateurCourant();
    if (!u?.formule) return null;
    const utilises = jobs().filter((j) => j.client.id === u.id && memeMois(j.createdAt)).length;
    return Math.max(0, u.formule.quotaFilmsMois - utilises);
  },

  /* ——— Côté studio Vesta ——— */

  async tousLesJobs() {
    return jobs().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async changerStatus(jobId, status, message) {
    const { tous, i } = trouverJob(jobId);
    tous[i] = { ...tous[i], status, statusMessage: message?.trim() || null };
    ecrire(CLE_JOBS, tous);
    if (status === "livre") {
      await emailLivraison(tous[i]);
    } else if (status === "attention_requise") {
      await notifier({
        type: "complement-demande",
        destinataire: tous[i].client.email,
        sujet: `Une précision est nécessaire : ${tous[i].property.title}`,
        corps: `${message?.trim() || "Le studio a besoin d'une précision sur votre demande."} Répondez depuis votre espace client : ${lienEspace()}`,
      });
    }
    return tous[i];
  },

  async deposerLivrable(jobId, livrable) {
    const { tous, i } = trouverJob(jobId);
    tous[i] = { ...tous[i], deliverables: [...tous[i].deliverables, livrable] };
    ecrire(CLE_JOBS, tous);
    return tous[i];
  },

  async renvoyerEmailLivraison(jobId) {
    const { tous, i } = trouverJob(jobId);
    await emailLivraison(tous[i]);
  },

  async comptesClients() {
    semer();
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    const tous = jobs();
    return users
      .filter((u) => u.role === "client")
      .map((u) => ({
        id: u.id,
        email: u.email,
        agence: u.agence ?? "",
        formule: u.formule ?? { nom: "Sans formule", quotaFilmsMois: 0 },
        filmsCeMois: tous.filter((j) => j.client.id === u.id && memeMois(j.createdAt)).length,
      }));
  },

  async creerCompteClient(email, agence, formule) {
    semer();
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Un compte existe déjà pour cet email.");
    }
    const jeton = id("inv");
    const invites = lire<InviteStockee[]>(CLE_INVITES, []);
    ecrire(CLE_INVITES, [...invites, { jeton, email, agence, formule }]);
    const base = typeof window !== "undefined" ? `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}` : "";
    return { lienInvitation: `${base}/creer-acces/?invite=${jeton}` };
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
