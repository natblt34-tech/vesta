import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifierToken, versContrat, COLONNES_JOB, type LigneJob } from "@/lib/server/pipeline";

/* GET /api/pipeline/jobs?status=recu — liste des demandes à traiter. */
export async function GET(req: Request) {
  if (!verifierToken(req)) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const admin = supabaseAdmin();
  let q = admin.from("jobs").select(COLONNES_JOB).order("cree_le", { ascending: true });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ erreur: "Lecture impossible." }, { status: 500 });

  return NextResponse.json({ jobs: await versContrat((data ?? []) as LigneJob[]) });
}
