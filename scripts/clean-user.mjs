import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const e = Object.fromEntries(
  txt.split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const admin = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
console.log("Comptes restants :", data.users.map((u) => u.email).join(", ") || "(aucun)");
const u = data.users.find((x) => (x.email || "").toLowerCase() === "agence-test@example.com");
if (u) {
  await admin.auth.admin.deleteUser(u.id);
  await admin.from("profiles").delete().eq("id", u.id);
  console.log("Compte de test supprimé.");
} else {
  console.log("Compte de test déjà absent.");
}
