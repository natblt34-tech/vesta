import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifierToken } from "@/lib/server/pipeline";
import { envoyerEmail, lienEspace } from "@/lib/server/email";

const KINDS = ["film_16x9", "film_9x16", "staging_avant_apres"];

/* POST /api/pipeline/jobs/{id}/deliverables — { deliverables: [{kind, url, room?}] }.
   Passe le job à "livre" et notifie le client. Le pipeline fournit des URLs
   déjà accessibles (upload effectué de son côté vers le stockage). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifierToken(req)) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const body = (await req.json()) as { deliverables?: { kind: string; url: string; room?: string }[] };
  const entrants = (body.deliverables ?? []).filter((d) => KINDS.includes(d.kind) && d.url);
  if (entrants.length === 0) return NextResponse.json({ erreur: "Aucun livrable valide." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: job } = await admin
    .from("jobs")
    .select("deliverables, property_title, property_city, client_email")
    .eq("id", id)
    .maybeSingle();
  if (!job) return NextResponse.json({ erreur: "Demande introuvable." }, { status: 404 });

  const deliverables = [
    ...((job.deliverables as unknown[]) ?? []),
    ...entrants.map((d) => ({ kind: d.kind, url: d.url, ...(d.room ? { room: d.room } : {}) })),
  ];
  const { error } = await admin.from("jobs").update({ deliverables, status: "livre" }).eq("id", id);
  if (error) return NextResponse.json({ erreur: "Enregistrement impossible." }, { status: 500 });

  await envoyerEmail(
    job.client_email,
    `Votre film est prêt : ${job.property_title}`,
    `Le film de « ${job.property_title} » (${job.property_city}) est disponible : ${lienEspace()}`,
  );
  return NextResponse.json({ ok: true, status: "livre" });
}
