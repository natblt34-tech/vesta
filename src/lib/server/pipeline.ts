import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/* Authentification du pipeline : Authorization: Bearer <PIPELINE_TOKEN>. */
export function verifierToken(req: Request): boolean {
  const attendu = process.env.PIPELINE_TOKEN;
  if (!attendu) return false;
  const recu = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  return recu.length > 0 && recu === attendu;
}

const EXP = 86400; // 24 h : le pipeline a le temps de télécharger.

export type LigneJob = {
  id: string;
  cree_le: string;
  agence_id: string;
  client_email: string;
  property_title: string;
  property_city: string;
  photos: { room: string; path: string }[];
  floorplan_path: string | null;
  agencement: string;
  options: unknown;
  status: string;
  status_message: string | null;
  deliverables: { kind: string; path?: string; url?: string; room?: string }[];
  reponses: { texte: string; photos: { room: string; path: string }[]; le: string }[];
  agences?: { nom: string } | null;
};

async function signerLot(bucket: string, chemins: string[]): Promise<Record<string, string>> {
  const admin = supabaseAdmin();
  const uniques = [...new Set(chemins.filter(Boolean))];
  if (!uniques.length) return {};
  const { data } = await admin.storage.from(bucket).createSignedUrls(uniques, EXP);
  const map: Record<string, string> = {};
  (data ?? []).forEach((d) => {
    if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  });
  return map;
}

/* Transforme des lignes de base en JSON du contrat pipeline (PIPELINE.md),
   avec URLs signées lisibles par le pipeline. */
export async function versContrat(rows: LigneJob[]) {
  const photos: string[] = [];
  const videos: string[] = [];
  for (const r of rows) {
    (r.photos ?? []).forEach((p) => photos.push(p.path));
    if (r.floorplan_path) photos.push(r.floorplan_path);
    (r.reponses ?? []).forEach((rep) => (rep.photos ?? []).forEach((p) => photos.push(p.path)));
    (r.deliverables ?? []).forEach((d) => {
      if (!d.url && d.path) videos.push(d.path);
    });
  }
  const pu = await signerLot("photos", photos);
  const vu = await signerLot("deliverables", videos);

  return rows.map((r) => ({
    id: r.id,
    createdAt: r.cree_le,
    client: { id: r.agence_id, agence: r.agences?.nom ?? "", email: r.client_email },
    property: { title: r.property_title, city: r.property_city },
    photos: (r.photos ?? []).map((p) => ({ room: p.room, url: pu[p.path] ?? "" })),
    floorplanUrl: r.floorplan_path ? pu[r.floorplan_path] ?? null : null,
    agencement: r.agencement,
    options: r.options,
    status: r.status,
    statusMessage: r.status_message,
    deliverables: (r.deliverables ?? []).map((d) => ({
      kind: d.kind,
      url: d.url ?? (d.path ? vu[d.path] ?? "" : ""),
      ...(d.room ? { room: d.room } : {}),
    })),
    reponses: (r.reponses ?? []).map((rep) => ({
      texte: rep.texte,
      le: rep.le,
      photos: (rep.photos ?? []).map((p) => ({ room: p.room, url: pu[p.path] ?? "" })),
    })),
  }));
}

export const COLONNES_JOB = "*, agences(nom)";
