import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FORMULES } from "@/lib/client/types";

/* Détail d'une invitation (avant inscription) : fondateur -> formule,
   membre -> nom de l'agence rejointe. Lecture via clé secrète (la table
   invitations n'est pas exposée au public). */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  if (!UUID.test(jeton)) return NextResponse.json({ erreur: "Invitation invalide." }, { status: 404 });
  const admin = supabaseAdmin();
  const { data: inv } = await admin
    .from("invitations")
    .select("type, email, formule_id, agence_id")
    .eq("jeton", jeton)
    .is("utilise_le", null)
    .maybeSingle();
  if (!inv) return NextResponse.json({ erreur: "Invitation invalide ou déjà utilisée." }, { status: 404 });

  if (inv.type === "fondateur") {
    const formule = FORMULES.find((f) => f.id === inv.formule_id) ?? FORMULES[0];
    return NextResponse.json({ type: "fondateur", formule, email: inv.email ?? undefined });
  }
  const { data: ag } = await admin.from("agences").select("nom").eq("id", inv.agence_id).maybeSingle();
  return NextResponse.json({ type: "membre", agenceId: inv.agence_id, agenceNom: ag?.nom ?? "" });
}
