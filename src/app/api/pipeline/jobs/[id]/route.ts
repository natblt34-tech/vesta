import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifierToken, versContrat, COLONNES_JOB, type LigneJob } from "@/lib/server/pipeline";

/* GET /api/pipeline/jobs/{id} — détail d'une demande. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifierToken(req)) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin.from("jobs").select(COLONNES_JOB).eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ erreur: "Demande introuvable." }, { status: 404 });
  return NextResponse.json((await versContrat([data as LigneJob]))[0]);
}
