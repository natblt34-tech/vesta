import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { appelant } from "@/lib/server/session";
import { envoyerEmail, lienEspace } from "@/lib/server/email";

/* Renvoi de l'email de livraison (studio). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const moi = await appelant();
  if (!moi || moi.role !== "vesta") return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  const { id } = await params;

  const admin = supabaseAdmin();
  const { data: job } = await admin
    .from("jobs")
    .select("property_title, property_city, client_email")
    .eq("id", id)
    .maybeSingle();
  if (!job) return NextResponse.json({ erreur: "Demande introuvable." }, { status: 404 });

  await envoyerEmail(
    job.client_email,
    `Votre film est prêt : ${job.property_title}`,
    `Le film de « ${job.property_title} » (${job.property_city}) est disponible dans votre espace client : ${lienEspace()}`,
  );
  return NextResponse.json({ ok: true });
}
