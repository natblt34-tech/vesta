import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const e = Object.fromEntries(txt.split(/\r?\n/).map(l=>l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m=>[m[1],m[2]]));
const admin = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SECRET_KEY, { auth:{persistSession:false} });
const NEW = "nbellet@lares-re.com", PW = e.ADMIN_PASSWORD;
const { data } = await admin.auth.admin.listUsers({ page:1, perPage:200 });
// supprimer ancien(s)
for (const em of ["nbellet@vesta-re.com","nbellet@lares-re.com"]) {
  const u = data.users.find(x => (x.email||"").toLowerCase() === em);
  if (u) { await admin.auth.admin.deleteUser(u.id); console.log("supprime:", em); }
}
// recreer
const { data: c, error } = await admin.auth.admin.createUser({ email: NEW, password: PW, email_confirm: true });
if (error) { console.log("createUser ERREUR:", error.message); process.exit(1); }
const { error: pe } = await admin.from("profiles").upsert({ id: c.user.id, email: NEW, role: "vesta", prenom: "Studio" }, { onConflict: "id" });
if (pe) { console.log("profil ERREUR:", pe.message); process.exit(1); }
console.log("Admin recree:", NEW, "role vesta (mot de passe inchange)");
