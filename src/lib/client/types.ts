/* Types du portail client, alignés sur le CONTRAT PIPELINE (brief-espace-client).
   Le schéma `Job` est celui que l'API REST servira au pipeline : mêmes noms de
   champs, mêmes valeurs de `status` et de `kind`. Ne pas dévier. */

export type Role = "client" | "vesta";

export type Formule = {
  /* Jamais de montant : nom commercial + quota films/mois uniquement. */
  nom: string;
  quotaFilmsMois: number;
};

export type User = {
  id: string;
  email: string;
  role: Role;
  agence?: string;
  formule?: Formule;
};

export type Format = "16:9" | "9:16";

export const STYLES_STAGING = [
  "bois clair & tons neutres",
  "contemporain contrasté",
  "laisser Vesta choisir",
] as const;
export type StyleStaging = (typeof STYLES_STAGING)[number];

/* Statuts : code technique = contrat pipeline, libellé = affichage client. */
export type StatusJob =
  | "recu"
  | "analyse"
  | "en_production"
  | "controle_qualite"
  | "livre"
  | "attention_requise";

export const LIBELLE_STATUS: Record<StatusJob, string> = {
  recu: "REÇUE",
  analyse: "ANALYSE DE L'AGENCEMENT",
  en_production: "PRODUCTION EN COURS",
  controle_qualite: "CONTRÔLE QUALITÉ",
  livre: "LIVRÉE",
  attention_requise: "COMPLÉMENT DEMANDÉ",
};

export function couleurStatus(s: StatusJob): string {
  if (s === "livre") return "var(--color-braise-vive)";
  if (s === "attention_requise") return "var(--color-braise)";
  return "var(--color-bronze)";
}

export type JobPhoto = {
  /* Clé d'entrée du pipeline : nom de pièce court, normalisé (sejour1…). */
  room: string;
  /* Mock : data URL. Prod : URL de stockage signée, jamais publique. */
  url: string;
};

export type DeliverableKind = "film_16x9" | "film_9x16" | "staging_avant_apres";

export const LIBELLE_LIVRABLE: Record<DeliverableKind, string> = {
  film_16x9: "FILM 16:9",
  film_9x16: "FILM 9:16",
  staging_avant_apres: "STAGING AVANT/APRÈS",
};

export type Deliverable = {
  kind: DeliverableKind;
  url: string;
  /* Pour staging_avant_apres : la pièce concernée. */
  room?: string;
};

export type OptionsJob = {
  formats: Format[];
  staging: { room: string; style: StyleStaging }[];
  exclude: string[];
};

/* Réponse du client à un `attention_requise`. Extension espace client,
   hors contrat pipeline (le pipeline relit le job entier). */
export type ReponseComplement = {
  texte: string;
  photos: JobPhoto[];
  le: string; // ISO
};

export type Job = {
  id: string; // job_xxx
  createdAt: string; // ISO 8601
  client: { id: string; agence: string; email: string };
  property: { title: string; city: string };
  photos: JobPhoto[];
  floorplanUrl: string | null;
  agencement: string; // markdown accepté
  options: OptionsJob;
  status: StatusJob;
  statusMessage: string | null;
  deliverables: Deliverable[];
  reponses: ReponseComplement[];
};

export type NouvelleDemandeData = {
  property: { title: string; city: string };
  photos: JobPhoto[];
  floorplanUrl: string | null;
  agencement: string;
  options: OptionsJob;
};

/* Compte client vu par l'admin. */
export type CompteClient = {
  id: string;
  email: string;
  agence: string;
  formule: Formule;
  filmsCeMois: number;
};
