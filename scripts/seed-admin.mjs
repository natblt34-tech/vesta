/* Crée (ou met à jour) le compte studio Vesta à partir de ADMIN_EMAIL /
   ADMIN_PASSWORD du .env.local. Rôle 'vesta'. Idempotent. */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const e = Object.fromEntries(
  txt.split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);

const admin = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = (e.ADMIN_EMAIL || "").toLowerCase();
const password = e.ADMIN_PASSWORD;
if (!email || !password) {
  console.error("ADMIN_EMAIL / ADMIN_PASSWORD manquants dans .env.local");
  process.exit(1);
}

async function trouver() {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const u = data.users.find((x) => (x.email || "").toLowerCase() === email);
    if (u) return u;
    if (data.users.length < 200) break;
  }
  return null;
}

let user = await trouver();

if (user) {
  await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  console.log("Compte existant : mot de passe mis à jour.");
} else {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    /* Course : déjà créé entre-temps -> on le retrouve. */
    user = await trouver();
    if (!user) {
      console.error("Création impossible :", error.message);
      process.exit(1);
    }
    await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    console.log("Compte retrouvé : mot de passe mis à jour.");
  } else {
    user = data.user;
    console.log("Compte créé.");
  }
}

const { error: perr } = await admin
  .from("profiles")
  .upsert({ id: user.id, email, role: "vesta", prenom: "Studio" }, { onConflict: "id" });
if (perr) {
  console.error("Profil :", perr.message);
  process.exit(1);
}

console.log(`Studio prêt : ${email} (role vesta)`);
