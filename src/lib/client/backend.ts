"use client";

/* ————————————————————————————————————————————————————————————
   LE POINT DE BRANCHEMENT BACKEND.

   Tout le portail parle à cette interface `VestaBackend`, jamais à
   localStorage directement. Aujourd'hui : implémentation `mockBackend`
   (persistance navigateur). Le jour de la mise en ligne, un adaptateur
   réel (Supabase ou petit serveur Node) implémente la même interface
   et on change la seule ligne `export const backend = ...` en bas.

   Modèle : l'AGENCE est le workspace. Le fondateur (invité par Vesta)
   nomme son agence à la création de ses accès ; il invite ensuite ses
   collègues, rattachés automatiquement au même workspace. Demandes,
   formule et quota appartiennent à l'agence.

   Les jobs sont stockés AU FORMAT EXACT du contrat pipeline
   (voir PIPELINE.md) : `client.id` est l'identifiant de l'agence.
   ———————————————————————————————————————————————————————————— */

import {
  FORMULES,
  type Agence,
  type CompteAgence,
  type Deliverable,
  type Formule,
  type Invitation,
  type Job,
  type JobPhoto,
  type Membre,
  type NouvelleDemandeData,
  type StatusJob,
  type User,
} from "./types";
import { notifier } from "./notify";

export interface VestaBackend {
  // Auth — pas d'inscription libre : invitation Vesta (fondateur)
  // ou invitation d'agence (membre).
  utilisateurCourant(): User | null;
  connexion(email: string, motDePasse: string): Promise<User>;
  infoInvitation(jeton: string): Promise<Invitation | null>;
  creerAcces(invite: string, email: string, motDePasse: string, nomAgence?: string): Promise<User>;
  /* Première connexion : l'utilisateur s'attribue son prénom. */
  definirPrenom(prenom: string): Promise<User>;
  deconnexion(): void;

  // Côté client (workspace agence)
  monAgence(): Promise<(Agence & { membres: Membre[] }) | null>;
  inviterMembre(): Promise<{ lienInvitation: string }>;
  mesJobs(): Promise<Job[]>;
  creerJob(d: NouvelleDemandeData): Promise<Job>;
  repondreComplement(jobId: string, texte: string, photos: JobPhoto[]): Promise<Job>;
  /* Films restants ce mois-ci pour la formule de l'agence. */
  filmsRestants(): Promise<number | null>;
  /* Photos de home staging déjà commandées ce mois-ci par l'agence. */
  stagingUtilisesCeMois(): Promise<number>;

  // Côté studio Vesta (admin)
  tousLesJobs(): Promise<Job[]>;
  changerStatus(jobId: string, status: StatusJob, message?: string): Promise<Job>;
  deposerLivrable(jobId: string, livrable: Deliverable): Promise<Job>;
  renvoyerEmailLivraison(jobId: string): Promise<void>;
  agences(): Promise<CompteAgence[]>;
  /* Invitation fondateur : email + formule ; le client nommera son agence. */
  creerInvitationClient(email: string, formule: Formule): Promise<{ lienInvitation: string }>;

  demanderAide(message: string): Promise<void>;
}

/* —————————————————— Implémentation mock (démo locale) —————————————————— */

const CLE_USERS = "vesta-users-v3";
const CLE_AGENCES = "vesta-agences";
const CLE_JOBS = "vesta-jobs";
const CLE_SESSION = "vesta-session-v3";
const CLE_INVITES = "vesta-invites-v2";

type CompteStocke = User & { motDePasse: string };
type InviteStockee =
  | { jeton: string; type: "fondateur"; email: string; formule: Formule }
  | { jeton: string; type: "membre"; agenceId: string };

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
    ecrire(CLE_AGENCES, [
      {
        id: "cli_demo",
        nom: "Agence Démo",
        formule: FORMULES.find((f) => f.id === "flamme")!,
        creeLe: new Date().toISOString(),
      } satisfies Agence,
    ]);
    ecrire(CLE_USERS, [
      { id: "vesta", email: "studio@vesta", role: "vesta", motDePasse: "vesta" },
      { id: "demo", email: "agence@demo", role: "client", agenceId: "cli_demo", motDePasse: "demo" },
    ]);
  }
}

/* Les agences créées avant la plaquette portent l'ancien format de
   formule : on les rattache au catalogue actuel. */
const ANCIENNES_FORMULES: Record<string, string> = {
  essentiel: "etincelle",
  studio: "flamme",
  signature: "brasier",
};

function normaliserFormule(f: Formule | { id?: string } | undefined): Formule {
  if (f && "stagingPhotosMois" in f && "montageInclus" in f) return f as Formule;
  return FORMULES.find((x) => x.id === ANCIENNES_FORMULES[f?.id ?? ""]) ?? FORMULES[0];
}

function agencesStockees(): Agence[] {
  return lire<Agence[]>(CLE_AGENCES, []).map((a) => ({ ...a, formule: normaliserFormule(a.formule) }));
}

function agenceDe(u: User | null): Agence | null {
  if (!u?.agenceId) return null;
  return agencesStockees().find((a) => a.id === u.agenceId) ?? null;
}

/* ——— Stockage des jobs : IndexedDB. Les photos en data URL dépassent
   vite le quota localStorage (~5 Mo) dès une vraie demande de 12 photos ;
   IndexedDB se compte en Go. Comptes, invites et session restent en
   localStorage, légers. ——— */

const IDB_NOM = "vesta-demo";
const IDB_STORE = "kv";
let dbPromesse: Promise<IDBDatabase> | null = null;

function ouvrirIdb(): Promise<IDBDatabase> {
  if (!dbPromesse) {
    dbPromesse = new Promise((resolve, reject) => {
      const req = window.indexedDB.open(IDB_NOM, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromesse;
}

async function ecrireJobs(tous: Job[]): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) return;
  const db = await ouvrirIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(tous, CLE_JOBS);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function jobs(): Promise<Job[]> {
  if (typeof window === "undefined" || !window.indexedDB) return [];
  const db = await ouvrirIdb();
  const stockes = await new Promise<Job[]>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(CLE_JOBS);
    req.onsuccess = () => resolve((req.result as Job[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  /* Migration : les jobs d'avant vivaient en localStorage. */
  const anciens = window.localStorage.getItem(CLE_JOBS);
  if (anciens) {
    window.localStorage.removeItem(CLE_JOBS);
    try {
      const fusion = [...(JSON.parse(anciens) as Job[]), ...stockes];
      await ecrireJobs(fusion);
      return fusion;
    } catch {
      /* anciens illisibles : on continue avec l'IndexedDB */
    }
  }
  return stockes;
}

async function trouverJob(jobId: string): Promise<{ tous: Job[]; i: number }> {
  const tous = await jobs();
  const i = tous.findIndex((j) => j.id === jobId);
  if (i < 0) throw new Error("Demande introuvable.");
  return { tous, i };
}

function base(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;
}

function lienEspace(): string {
  return `${base()}/espace/`;
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

  async infoInvitation(jeton) {
    semer();
    if (jeton === "demo-invite") {
      return { type: "fondateur", formule: FORMULES[0] };
    }
    const inv = lire<InviteStockee[]>(CLE_INVITES, []).find((x) => x.jeton === jeton);
    if (!inv) return null;
    if (inv.type === "fondateur") return { type: "fondateur", formule: inv.formule, email: inv.email };
    const agence = agencesStockees().find((a) => a.id === inv.agenceId);
    if (!agence) return null;
    return { type: "membre", agenceId: agence.id, agenceNom: agence.nom };
  },

  async creerAcces(invite, email, motDePasse, nomAgence) {
    semer();
    const info = await this.infoInvitation(invite);
    if (!info) throw new Error("Lien d'invitation invalide ou déjà utilisé.");
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Un compte existe déjà pour cet email.");
    }

    let agenceId: string;
    if (info.type === "fondateur") {
      /* Le fondateur crée le workspace de son agence. */
      if (!nomAgence?.trim()) throw new Error("Indiquez le nom de votre agence.");
      const agence: Agence = {
        id: id("cli"),
        nom: nomAgence.trim(),
        formule: info.formule,
        creeLe: new Date().toISOString(),
      };
      ecrire(CLE_AGENCES, [...agencesStockees(), agence]);
      agenceId = agence.id;
    } else {
      /* Le membre rejoint le workspace existant. */
      agenceId = info.agenceId;
    }

    const user: User = { id: id("usr"), email, role: "client", agenceId };
    ecrire(CLE_USERS, [...users, { ...user, motDePasse }]);
    if (invite !== "demo-invite") {
      ecrire(CLE_INVITES, lire<InviteStockee[]>(CLE_INVITES, []).filter((x) => x.jeton !== invite));
    }
    ecrire(CLE_SESSION, user);
    return user;
  },

  async definirPrenom(prenom) {
    const u = this.utilisateurCourant();
    if (!u) throw new Error("Non connecté.");
    const propre = prenom.trim();
    if (!propre) throw new Error("Indiquez votre prénom.");
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    const i = users.findIndex((x) => x.id === u.id);
    if (i >= 0) {
      users[i] = { ...users[i], prenom: propre };
      ecrire(CLE_USERS, users);
    }
    const maj: User = { ...u, prenom: propre };
    ecrire(CLE_SESSION, maj);
    return maj;
  },

  deconnexion() {
    if (typeof window !== "undefined") window.localStorage.removeItem(CLE_SESSION);
  },

  /* ——— Côté client (workspace agence) ——— */

  async monAgence() {
    semer();
    const u = this.utilisateurCourant();
    const agence = agenceDe(u);
    if (!agence) return null;
    const membres: Membre[] = lire<CompteStocke[]>(CLE_USERS, [])
      .filter((x) => x.agenceId === agence.id)
      .map((x) => ({ email: x.email, prenom: x.prenom }));
    return { ...agence, membres };
  },

  async inviterMembre() {
    const u = this.utilisateurCourant();
    const agence = agenceDe(u);
    if (!agence) throw new Error("Non connecté.");
    const jeton = id("inv");
    ecrire(CLE_INVITES, [...lire<InviteStockee[]>(CLE_INVITES, []), { jeton, type: "membre", agenceId: agence.id }]);
    /* En prod : email d'invitation envoyé au collègue (Resend). */
    return { lienInvitation: `${base()}/creer-acces/?invite=${jeton}` };
  },

  async mesJobs() {
    const u = this.utilisateurCourant();
    if (!u?.agenceId) return [];
    return (await jobs())
      .filter((j) => j.client.id === u.agenceId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async creerJob(d) {
    const u = this.utilisateurCourant();
    const agence = agenceDe(u);
    if (!u || !agence) throw new Error("Non connecté.");
    /* Les restrictions de la formule s'appliquent ici aussi (pas
       seulement dans l'interface) : quotas bloquants, staging plafonné. */
    const restants = await this.filmsRestants();
    if (restants !== null && restants <= 0) {
      throw new Error("Quota du mois atteint. Rapprochez-vous du studio pour ajuster votre formule.");
    }
    const quotaStaging = agence.formule.stagingPhotosMois;
    if (quotaStaging === null) {
      d = { ...d, options: { ...d.options, staging: [] } };
    } else if (typeof quotaStaging === "number") {
      const utilises = await this.stagingUtilisesCeMois();
      if (d.options.staging.length > Math.max(0, quotaStaging - utilises)) {
        throw new Error("Quota de home staging du mois dépassé.");
      }
    }
    const job: Job = {
      id: id("job"),
      createdAt: new Date().toISOString(),
      client: { id: agence.id, agence: agence.nom, email: u.email, prenom: u.prenom },
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
    try {
      await ecrireJobs([job, ...(await jobs())]);
    } catch {
      throw new Error("Enregistrement impossible sur cet appareil. Libérez de l'espace de stockage et réessayez.");
    }
    await notifier({
      type: "nouvelle-demande",
      destinataire: "studio@vesta",
      sujet: `Nouvelle demande : ${job.property.title} (${job.property.city})`,
      corps: `${agence.nom} (${u.email}) a déposé « ${job.property.title} » : ${job.photos.length} photos, formats ${job.options.formats.join(" + ")}, staging ${job.options.staging.length ? job.options.staging.map((s) => s.room).join(", ") : "non"}.`,
    });
    return job;
  },

  async repondreComplement(jobId, texte, photos) {
    const u = this.utilisateurCourant();
    if (!u) throw new Error("Non connecté.");
    const { tous, i } = await trouverJob(jobId);
    tous[i] = {
      ...tous[i],
      reponses: [...tous[i].reponses, { texte, photos, le: new Date().toISOString() }],
      /* Le complément fourni, la demande repart en analyse. */
      status: "analyse",
      statusMessage: null,
    };
    await ecrireJobs(tous);
    await notifier({
      type: "complement-reponse",
      destinataire: "studio@vesta",
      sujet: `Complément reçu : ${tous[i].property.title}`,
      corps: `${u.email} a répondu (${photos.length} photo(s) jointe(s)) : ${texte}`,
    });
    return tous[i];
  },

  async filmsRestants() {
    const agence = agenceDe(this.utilisateurCourant());
    if (!agence) return null;
    const utilises = (await jobs()).filter((j) => j.client.id === agence.id && memeMois(j.createdAt)).length;
    return Math.max(0, agence.formule.quotaFilmsMois - utilises);
  },

  async stagingUtilisesCeMois() {
    const agence = agenceDe(this.utilisateurCourant());
    if (!agence) return 0;
    return (await jobs())
      .filter((j) => j.client.id === agence.id && memeMois(j.createdAt))
      .reduce((n, j) => n + j.options.staging.length, 0);
  },

  /* ——— Côté studio Vesta ——— */

  async tousLesJobs() {
    return (await jobs()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async changerStatus(jobId, status, message) {
    const { tous, i } = await trouverJob(jobId);
    tous[i] = { ...tous[i], status, statusMessage: message?.trim() || null };
    await ecrireJobs(tous);
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
    const { tous, i } = await trouverJob(jobId);
    tous[i] = { ...tous[i], deliverables: [...tous[i].deliverables, livrable] };
    await ecrireJobs(tous);
    return tous[i];
  },

  async renvoyerEmailLivraison(jobId) {
    const { tous, i } = await trouverJob(jobId);
    await emailLivraison(tous[i]);
  },

  async agences() {
    semer();
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    const tous = await jobs();
    return agencesStockees().map((a) => ({
      id: a.id,
      nom: a.nom,
      formule: a.formule,
      filmsCeMois: tous.filter((j) => j.client.id === a.id && memeMois(j.createdAt)).length,
      membres: users.filter((u) => u.agenceId === a.id).map((u) => u.email),
    }));
  },

  async creerInvitationClient(email, formule) {
    semer();
    const users = lire<CompteStocke[]>(CLE_USERS, []);
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Un compte existe déjà pour cet email.");
    }
    const jeton = id("inv");
    ecrire(CLE_INVITES, [...lire<InviteStockee[]>(CLE_INVITES, []), { jeton, type: "fondateur", email, formule }]);
    return { lienInvitation: `${base()}/creer-acces/?invite=${jeton}` };
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
