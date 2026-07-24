/* Supprime les données de test (agence + user + jobs + fichiers). */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const e = Object.fromEntries(
  txt.split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const admin = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL_TEST = "agence-test@example.com";
const NOM_TEST = "Agence Test Immo";

/* Agence de test + son dossier de fichiers. */
const { data: ag } = await admin.from("agences").select("id").eq("nom", NOM_TEST).maybeSingle();
if (ag) {
  for (const bucket of ["photos", "deliverables"]) {
    const { data: objets } = await admin.storage.from(bucket).list(ag.id, { limit: 1000 });
    /* Liste récursive simple : sous-dossiers = jobs. */
    for (const dossier of objets ?? []) {
      const { data: fichiers } = await admin.storage.from(bucket).list(`${ag.id}/${dossier.name}`, { limit: 1000 });
      const chemins = (fichiers ?? []).map((f) => `${ag.id}/${dossier.name}/${f.name}`);
      if (chemins.length) await admin.storage.from(bucket).remove(chemins);
    }
  }
  await admin.from("agences").delete().eq("id", ag.id); // cascade jobs
  console.log(`Agence "${NOM_TEST}" et ses demandes/fichiers supprimés.`);
}

/* Utilisateur de test. */
const { data: liste } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
const u = liste.users.find((x) => (x.email || "").toLowerCase() === EMAIL_TEST);
if (u) {
  await admin.auth.admin.deleteUser(u.id);
  console.log(`Utilisateur ${EMAIL_TEST} supprimé.`);
}

/* Invitations consommées / de test. */
await admin.from("invitations").delete().eq("email", EMAIL_TEST);
console.log("Nettoyage terminé.");
