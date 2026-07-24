import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { appelant } from "@/lib/server/session";
import { envoyerEmail, EMAIL_STUDIO } from "@/lib/server/email";

/* Notifications vers le studio, déclenchées par l'app (contenu figé,
   pas de texte libre) : nouvelle demande, réponse à un complément. */
export async function POST(req: Request) {
  const moi = await appelant();
  if (!moi) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const { type, jobId } = (await req.json()) as { type?: string; jobId?: string };
  if (!jobId) return NextResponse.json({ erreur: "jobId manquant." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: job } = await admin
    .from("jobs")
    .select("property_title, property_city, client_email, agences(nom)")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return NextResponse.json({ erreur: "Demande introuvable." }, { status: 404 });

  const agence = (job.agences as { nom?: string } | null)?.nom ?? "";
  if (type === "nouvelle-demande") {
    await envoyerEmail(
      EMAIL_STUDIO,
      `Nouvelle demande : ${job.property_title} (${job.property_city})`,
      `${agence} (${job.client_email}) a déposé une nouvelle demande.`,
      job.client_email,
    );
  } else if (type === "complement-reponse") {
    await envoyerEmail(
      EMAIL_STUDIO,
      `Complément reçu : ${job.property_title}`,
      `${job.client_email} a répondu à la demande de précision.`,
      job.client_email,
    );
  }
  return NextResponse.json({ ok: true });
}
