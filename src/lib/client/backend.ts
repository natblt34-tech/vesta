"use client";

/* ————————————————————————————————————————————————————————————
   ADAPTATEUR BACKEND — Supabase.

   L'espace client parle à cet objet `backend`, jamais à Supabase
   directement. Les lectures et écritures scopées à l'agence passent par
   le client navigateur (RLS). Les opérations privilégiées (invitations,
   changement de statut + email, dépôt de livrables) passent par des routes
   API serveur (clé secrète). Les pages ne connaissent que cette interface.
   ———————————————————————————————————————————————————————————— */

import { supabaseNavigateur } from "@/lib/supabase/client";
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
} from "./types";

const EXPIRATION_SIGNATURE = 3600; // 1 h

function resoudreFormule(id: string | null | undefined): Formule {
  return FORMULES.find((f) => f.id === id) ?? FORMULES[0];
}

function memeMois(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

async function dataUrlVersBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

/* Profil de l'utilisateur courant (id, email, prénom, agence, rôle). */
async function profilCourant() {
  const sb = supabaseNavigateur();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Non connecté.");
  const { data: profil } = await sb
    .from("profiles")
    .select("prenom, role, agence_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  return {
    id: auth.user.id,
    email: auth.user.email ?? "",
    prenom: (profil?.prenom as string | null) ?? undefined,
    role: (profil?.role as "client" | "vesta") ?? "client",
    agenceId: (profil?.agence_id as string | null) ?? undefined,
  };
}

/* Signe un lot de chemins de storage en une fois. */
async function signer(bucket: string, chemins: string[]): Promise<Record<string, string>> {
  const sb = supabaseNavigateur();
  const uniques = [...new Set(chemins.filter(Boolean))];
  if (uniques.length === 0) return {};
  const { data } = await sb.storage.from(bucket).createSignedUrls(uniques, EXPIRATION_SIGNATURE);
  const map: Record<string, string> = {};
  (data ?? []).forEach((d) => {
    if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  });
  return map;
}

type LigneJob = {
  id: string;
  cree_le: string;
  agence_id: string;
  client_email: string;
  client_prenom: string | null;
  property_title: string;
  property_city: string;
  photos: { room: string; path: string }[];
  floorplan_path: string | null;
  agencement: string;
  options: Job["options"];
  status: StatusJob;
  status_message: string | null;
  deliverables: { kind: Deliverable["kind"]; path?: string; url?: string; room?: string }[];
  reponses: { texte: string; photos: { room: string; path: string }[]; le: string }[];
  agences?: { nom: string } | null;
};

/* Transforme une ou plusieurs lignes de base en `Job` d'affichage :
   les chemins de storage deviennent des URLs signées. */
async function versJobs(lignes: LigneJob[]): Promise<Job[]> {
  const cheminsPhotos: string[] = [];
  const cheminsVideos: string[] = [];
  for (const l of lignes) {
    l.photos?.forEach((p) => cheminsPhotos.push(p.path));
    if (l.floorplan_path) cheminsPhotos.push(l.floorplan_path);
    l.reponses?.forEach((r) => r.photos?.forEach((p) => cheminsPhotos.push(p.path)));
    l.deliverables?.forEach((d) => {
      if (!d.url && d.path) cheminsVideos.push(d.path);
    });
  }
  const photoUrls = await signer("photos", cheminsPhotos);
  const videoUrls = await signer("deliverables", cheminsVideos);
  const url = (m: Record<string, string>, p: string) => m[p] ?? "";

  return lignes.map((l) => ({
    id: l.id,
    createdAt: l.cree_le,
    client: {
      id: l.agence_id,
      agence: l.agences?.nom ?? "",
      email: l.client_email,
      prenom: l.client_prenom ?? undefined,
    },
    property: { title: l.property_title, city: l.property_city },
    photos: (l.photos ?? []).map((p) => ({ room: p.room, url: url(photoUrls, p.path) })),
    floorplanUrl: l.floorplan_path ? url(photoUrls, l.floorplan_path) : null,
    agencement: l.agencement,
    options: l.options,
    status: l.status,
    statusMessage: l.status_message,
    deliverables: (l.deliverables ?? []).map((d) => ({
      kind: d.kind,
      url: d.url ?? (d.path ? url(videoUrls, d.path) : ""),
      ...(d.room ? { room: d.room } : {}),
    })),
    reponses: (l.reponses ?? []).map((r) => ({
      texte: r.texte,
      le: r.le,
      photos: (r.photos ?? []).map((p) => ({ room: p.room, url: url(photoUrls, p.path) })),
    })),
  }));
}

const COLONNES = "*, agences(nom)";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const r = await fetch(url, options);
  const data = (await r.json().catch(() => ({}))) as T & { erreur?: string };
  if (!r.ok) throw new Error(data.erreur ?? "Opération impossible.");
  return data;
}

export interface LaresBackend {
  infoInvitation(jeton: string): Promise<Invitation | null>;

  monAgence(): Promise<(Agence & { membres: Membre[] }) | null>;
  inviterMembre(): Promise<{ lienInvitation: string }>;
  mesJobs(): Promise<Job[]>;
  creerJob(d: NouvelleDemandeData): Promise<Job>;
  repondreComplement(jobId: string, texte: string, photos: JobPhoto[]): Promise<Job>;
  filmsRestants(): Promise<number | null>;
  stagingUtilisesCeMois(): Promise<number>;

  tousLesJobs(): Promise<Job[]>;
  changerStatus(jobId: string, status: StatusJob, message?: string): Promise<Job>;
  deposerLivrable(jobId: string, livrable: Deliverable): Promise<Job>;
  renvoyerEmailLivraison(jobId: string): Promise<void>;
  agences(): Promise<CompteAgence[]>;
  creerInvitationClient(email: string, formule: Formule): Promise<{ lienInvitation: string }>;

  demanderAide(message: string): Promise<void>;
}

export const supabaseBackend: LaresBackend = {
  async infoInvitation(jeton) {
    try {
      return await fetchJson<Invitation>(`/api/invitations/${jeton}`);
    } catch {
      return null;
    }
  },

  async monAgence() {
    const sb = supabaseNavigateur();
    const moi = await profilCourant();
    if (!moi.agenceId) return null;
    const { data: a } = await sb
      .from("agences")
      .select("id, nom, formule_id, cree_le")
      .eq("id", moi.agenceId)
      .maybeSingle();
    if (!a) return null;
    const { data: membres } = await sb
      .from("profiles")
      .select("email, prenom")
      .eq("agence_id", moi.agenceId);
    return {
      id: a.id,
      nom: a.nom,
      formule: resoudreFormule(a.formule_id),
      creeLe: a.cree_le,
      membres: (membres ?? []).map((m) => ({ email: m.email, prenom: m.prenom ?? undefined })),
    };
  },

  async inviterMembre() {
    return fetchJson<{ lienInvitation: string }>("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "membre" }),
    });
  },

  async mesJobs() {
    const sb = supabaseNavigateur();
    const moi = await profilCourant();
    if (!moi.agenceId) return [];
    const { data } = await sb
      .from("jobs")
      .select(COLONNES)
      .eq("agence_id", moi.agenceId)
      .order("cree_le", { ascending: false });
    return versJobs((data ?? []) as LigneJob[]);
  },

  async creerJob(d) {
    const sb = supabaseNavigateur();
    const moi = await profilCourant();
    if (!moi.agenceId) throw new Error("Non connecté.");

    /* Quota films (garde-fou ; le RLS limite déjà à l'agence). */
    const restants = await this.filmsRestants();
    if (restants !== null && restants <= 0) {
      throw new Error("Quota du mois atteint. Rapprochez-vous du studio pour ajuster votre formule.");
    }

    /* Upload des photos (data URL -> storage), on garde les chemins. */
    const dossier = `${moi.agenceId}/${crypto.randomUUID()}`;
    const photos: { room: string; path: string }[] = [];
    for (let i = 0; i < d.photos.length; i += 1) {
      const p = d.photos[i];
      const path = `${dossier}/photo-${i}.jpg`;
      const blob = await dataUrlVersBlob(p.url);
      const { error } = await sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (error) throw new Error("Envoi d'une photo impossible.");
      photos.push({ room: p.room, path });
    }
    let floorplan_path: string | null = null;
    if (d.floorplanUrl) {
      floorplan_path = `${dossier}/plan`;
      const blob = await dataUrlVersBlob(d.floorplanUrl);
      await sb.storage.from("photos").upload(floorplan_path, blob, { upsert: true });
    }

    const { data, error } = await sb
      .from("jobs")
      .insert({
        agence_id: moi.agenceId,
        client_email: moi.email,
        client_prenom: moi.prenom ?? null,
        property_title: d.property.title,
        property_city: d.property.city,
        photos,
        floorplan_path,
        agencement: d.agencement,
        options: d.options,
        status: "recu",
      })
      .select(COLONNES)
      .single();
    if (error) throw new Error("Enregistrement impossible sur le serveur.");

    /* Notification studio (email), déclenchée côté serveur. */
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "nouvelle-demande", jobId: (data as LigneJob).id }),
    }).catch(() => {});

    return (await versJobs([data as LigneJob]))[0];
  },

  async repondreComplement(jobId, texte, photos) {
    const sb = supabaseNavigateur();
    const moi = await profilCourant();
    if (!moi.agenceId) throw new Error("Non connecté.");

    const { data: actuel } = await sb.from("jobs").select("reponses").eq("id", jobId).single();
    const dossier = `${moi.agenceId}/${jobId}/reponse-${Date.now()}`;
    const photosStockees: { room: string; path: string }[] = [];
    for (let i = 0; i < photos.length; i += 1) {
      const path = `${dossier}/photo-${i}.jpg`;
      const blob = await dataUrlVersBlob(photos[i].url);
      await sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      photosStockees.push({ room: photos[i].room, path });
    }
    const reponses = [
      ...(((actuel?.reponses as LigneJob["reponses"]) ?? [])),
      { texte, photos: photosStockees, le: new Date().toISOString() },
    ];
    const { data, error } = await sb
      .from("jobs")
      .update({ reponses, status: "analyse", status_message: null })
      .eq("id", jobId)
      .select(COLONNES)
      .single();
    if (error) throw new Error("Envoi impossible.");

    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "complement-reponse", jobId }),
    }).catch(() => {});

    return (await versJobs([data as LigneJob]))[0];
  },

  async filmsRestants() {
    const sb = supabaseNavigateur();
    const moi = await profilCourant();
    if (!moi.agenceId) return null;
    const { data: a } = await sb.from("agences").select("formule_id").eq("id", moi.agenceId).maybeSingle();
    const formule = resoudreFormule(a?.formule_id);
    const { data: jobs } = await sb.from("jobs").select("cree_le").eq("agence_id", moi.agenceId);
    const utilises = (jobs ?? []).filter((j) => memeMois(j.cree_le)).length;
    return Math.max(0, formule.quotaFilmsMois - utilises);
  },

  async stagingUtilisesCeMois() {
    const sb = supabaseNavigateur();
    const moi = await profilCourant();
    if (!moi.agenceId) return 0;
    const { data: jobs } = await sb.from("jobs").select("cree_le, options").eq("agence_id", moi.agenceId);
    return (jobs ?? [])
      .filter((j) => memeMois(j.cree_le))
      .reduce((n, j) => n + (((j.options as Job["options"])?.staging?.length) ?? 0), 0);
  },

  async tousLesJobs() {
    const sb = supabaseNavigateur();
    const { data } = await sb.from("jobs").select(COLONNES).order("cree_le", { ascending: false });
    return versJobs((data ?? []) as LigneJob[]);
  },

  async changerStatus(jobId, status, message) {
    const job = await fetchJson<{ job: LigneJob }>(`/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, message }),
    });
    return (await versJobs([job.job]))[0];
  },

  async deposerLivrable(jobId, livrable) {
    /* Le fichier est envoyé au serveur, qui l'upload avec la clé secrète. */
    const form = new FormData();
    form.append("kind", livrable.kind);
    if (livrable.room) form.append("room", livrable.room);
    const blob = await (await fetch(livrable.url)).blob();
    form.append("fichier", blob);
    const job = await fetchJson<{ job: LigneJob }>(`/api/jobs/${jobId}/deliverable`, {
      method: "POST",
      body: form,
    });
    return (await versJobs([job.job]))[0];
  },

  async renvoyerEmailLivraison(jobId) {
    await fetchJson(`/api/jobs/${jobId}/relivraison`, { method: "POST" });
  },

  async agences() {
    const sb = supabaseNavigateur();
    const { data: liste } = await sb.from("agences").select("id, nom, formule_id");
    const { data: membres } = await sb.from("profiles").select("email, agence_id");
    const { data: jobs } = await sb.from("jobs").select("agence_id, cree_le");
    return (liste ?? []).map((a) => ({
      id: a.id,
      nom: a.nom,
      formule: resoudreFormule(a.formule_id),
      membres: (membres ?? []).filter((m) => m.agence_id === a.id).map((m) => m.email),
      filmsCeMois: (jobs ?? []).filter((j) => j.agence_id === a.id && memeMois(j.cree_le)).length,
    }));
  },

  async creerInvitationClient(email, formule) {
    return fetchJson<{ lienInvitation: string }>("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "fondateur", email, formuleId: formule.id }),
    });
  },

  async demanderAide(message) {
    await fetch("/api/aide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }).catch(() => {});
  },
};

export const backend: LaresBackend = supabaseBackend;
