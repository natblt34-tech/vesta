import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { appelant } from "@/lib/server/session";
import { envoyerEmail, lienEspace } from "@/lib/server/email";

const STATUTS = ["recu", "analyse", "en_production", "controle_qualite", "livre", "attention_requise"];

/* Changement de statut d'une demande (studio uniquement) + email au client
   sur livraison / demande de complément. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const moi = await appelant();
  if (!moi || moi.role !== "vesta") return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  const { id } = await params;
  const { status, message } = (await req.json()) as { status?: string; message?: string };
  if (!status || !STATUTS.includes(status)) return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: job, error } = await admin
    .from("jobs")
    .update({ status, status_message: message?.trim() || null })
    .eq("id", id)
    .select("*, agences(nom)")
    .single();
  if (error || !job) return NextResponse.json({ erreur: "Demande introuvable." }, { status: 404 });

  if (status === "livre") {
    await envoyerEmail(
      job.client_email,
      `Votre film est prêt : ${job.property_title}`,
      `Le film de « ${job.property_title} » (${job.property_city}) est disponible dans votre espace client : ${lienEspace()}`,
    );
  } else if (status === "attention_requise") {
    await envoyerEmail(
      job.client_email,
      `Une précision est nécessaire : ${job.property_title}`,
      `${message?.trim() || "Le studio a besoin d'une précision sur votre demande."} Répondez depuis votre espace : ${lienEspace()}`,
    );
  }
  return NextResponse.json({ job });
}
