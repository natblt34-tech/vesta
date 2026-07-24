import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifierToken } from "@/lib/server/pipeline";
import { envoyerEmail, lienEspace } from "@/lib/server/email";

const STATUTS = ["recu", "analyse", "en_production", "controle_qualite", "livre", "attention_requise"];

/* POST /api/pipeline/jobs/{id}/status — { status, message? }. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifierToken(req)) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const { status, message } = (await req.json()) as { status?: string; message?: string };
  if (!status || !STATUTS.includes(status)) return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: job, error } = await admin
    .from("jobs")
    .update({ status, status_message: message?.trim() || null })
    .eq("id", id)
    .select("property_title, property_city, client_email")
    .single();
  if (error || !job) return NextResponse.json({ erreur: "Demande introuvable." }, { status: 404 });

  if (status === "livre") {
    await envoyerEmail(
      job.client_email,
      `Votre film est prêt : ${job.property_title}`,
      `Le film de « ${job.property_title} » (${job.property_city}) est disponible : ${lienEspace()}`,
    );
  } else if (status === "attention_requise") {
    await envoyerEmail(
      job.client_email,
      `Une précision est nécessaire : ${job.property_title}`,
      `${message?.trim() || "Une précision est nécessaire."} Répondez depuis votre espace : ${lienEspace()}`,
    );
  }
  return NextResponse.json({ ok: true, status });
}
