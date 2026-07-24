import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/* Inscription depuis une invitation. Atomique côté serveur (clé secrète) :
   valide l'invitation, crée le compte, crée l'agence (fondateur) ou rattache
   au workspace (membre), crée le profil, consomme l'invitation. */
export async function POST(req: Request) {
  const { invite, email, motDePasse, nomAgence } = (await req.json()) as {
    invite?: string;
    email?: string;
    motDePasse?: string;
    nomAgence?: string;
  };
  const err = (m: string, s = 400) => NextResponse.json({ erreur: m }, { status: s });

  if (!invite || !email || !motDePasse) return err("Champs manquants.");
  if (motDePasse.length < 6) return err("Le mot de passe doit faire au moins 6 caractères.");

  const admin = supabaseAdmin();
  const { data: inv } = await admin
    .from("invitations")
    .select("type, formule_id, agence_id")
    .eq("jeton", invite)
    .is("utilise_le", null)
    .maybeSingle();
  if (!inv) return err("Lien d'invitation invalide ou déjà utilisé.");
  if (inv.type === "fondateur" && !nomAgence?.trim()) return err("Indiquez le nom de votre agence.");

  /* Compte d'abord : échoue vite si l'email existe déjà. */
  const { data: cree, error: cErr } = await admin.auth.admin.createUser({
    email: email.trim(),
    password: motDePasse,
    email_confirm: true,
  });
  if (cErr || !cree.user) {
    return err(/already/i.test(cErr?.message ?? "") ? "Un compte existe déjà pour cet email." : "Création impossible.");
  }
  const userId = cree.user.id;

  try {
    let agenceId = inv.agence_id as string | null;
    if (inv.type === "fondateur") {
      const { data: ag, error } = await admin
        .from("agences")
        .insert({ nom: nomAgence!.trim(), formule_id: inv.formule_id ?? "etincelle" })
        .select("id")
        .single();
      if (error || !ag) throw new Error("agence");
      agenceId = ag.id;
    }

    const { error: pErr } = await admin
      .from("profiles")
      .insert({ id: userId, email: email.trim(), role: "client", agence_id: agenceId });
    if (pErr) throw new Error("profil");

    await admin.from("invitations").update({ utilise_le: new Date().toISOString() }).eq("jeton", invite);
    return NextResponse.json({ ok: true });
  } catch {
    /* Nettoyage : pas de compte orphelin si une étape échoue. */
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return err("Création impossible. Réessayez.", 500);
  }
}
