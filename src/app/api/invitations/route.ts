import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { appelant } from "@/lib/server/session";
import { FORMULES } from "@/lib/client/types";

/* Création d'une invitation.
   - 'fondateur' : réservé au studio (rôle vesta). email + formule.
   - 'membre'    : par un membre d'agence, pour rattacher un collègue. */
export async function POST(req: Request) {
  const moi = await appelant();
  if (!moi) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const body = (await req.json()) as { type?: string; email?: string; formuleId?: string };
  const admin = supabaseAdmin();
  const base = new URL(req.url).origin;
  const lien = (jeton: string) => ({ lienInvitation: `${base}/creer-acces/?invite=${jeton}` });

  if (body.type === "fondateur") {
    if (moi.role !== "vesta") return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
    if (!body.email?.trim()) return NextResponse.json({ erreur: "Email requis." }, { status: 400 });
    const formuleId = FORMULES.find((f) => f.id === body.formuleId)?.id ?? FORMULES[0].id;
    const { data, error } = await admin
      .from("invitations")
      .insert({ type: "fondateur", email: body.email.trim(), formule_id: formuleId })
      .select("jeton")
      .single();
    if (error) return NextResponse.json({ erreur: "Création impossible." }, { status: 500 });
    return NextResponse.json(lien(data.jeton));
  }

  if (body.type === "membre") {
    if (!moi.agenceId) return NextResponse.json({ erreur: "Aucune agence." }, { status: 403 });
    const { data, error } = await admin
      .from("invitations")
      .insert({ type: "membre", agence_id: moi.agenceId })
      .select("jeton")
      .single();
    if (error) return NextResponse.json({ erreur: "Création impossible." }, { status: 500 });
    return NextResponse.json(lien(data.jeton));
  }

  return NextResponse.json({ erreur: "Type d'invitation inconnu." }, { status: 400 });
}
