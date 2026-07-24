import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { appelant } from "@/lib/server/session";

/* Dépôt d'un livrable (studio) : le fichier est uploadé dans le bucket privé
   'deliverables' avec la clé secrète, puis référencé dans la demande. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const moi = await appelant();
  if (!moi || moi.role !== "vesta") return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  const { id } = await params;

  const form = await req.formData();
  const kind = String(form.get("kind") ?? "");
  const room = form.get("room") ? String(form.get("room")) : undefined;
  const fichier = form.get("fichier");
  if (!kind || !(fichier instanceof Blob)) return NextResponse.json({ erreur: "Fichier manquant." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: job } = await admin
    .from("jobs")
    .select("agence_id, deliverables")
    .eq("id", id)
    .maybeSingle();
  if (!job) return NextResponse.json({ erreur: "Demande introuvable." }, { status: 404 });

  const ext = kind === "staging_avant_apres" ? "jpg" : "mp4";
  const path = `${job.agence_id}/${id}/${kind}-${Date.now()}.${ext}`;
  const buf = Buffer.from(await fichier.arrayBuffer());
  const { error: upErr } = await admin.storage.from("deliverables").upload(path, buf, {
    contentType: fichier.type || (ext === "mp4" ? "video/mp4" : "image/jpeg"),
    upsert: true,
  });
  if (upErr) return NextResponse.json({ erreur: "Upload impossible." }, { status: 500 });

  const deliverables = [
    ...((job.deliverables as { kind: string; path: string; room?: string }[]) ?? []),
    { kind, path, ...(room ? { room } : {}) },
  ];
  const { data: maj, error } = await admin
    .from("jobs")
    .update({ deliverables })
    .eq("id", id)
    .select("*, agences(nom)")
    .single();
  if (error) return NextResponse.json({ erreur: "Enregistrement impossible." }, { status: 500 });
  return NextResponse.json({ job: maj });
}
