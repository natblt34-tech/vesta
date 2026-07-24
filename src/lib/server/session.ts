import "server-only";
import { supabaseServeur } from "@/lib/supabase/server";

/* Identité de l'appelant d'une route API, lue depuis sa session (cookies).
   Renvoie null si non connecté. Le rôle et l'agence viennent du profil. */
export async function appelant(): Promise<
  { id: string; email: string; role: "client" | "vesta"; agenceId: string | null } | null
> {
  const sb = await supabaseServeur();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data: profil } = await sb
    .from("profiles")
    .select("role, agence_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  return {
    id: auth.user.id,
    email: auth.user.email ?? "",
    role: (profil?.role as "client" | "vesta") ?? "client",
    agenceId: (profil?.agence_id as string | null) ?? null,
  };
}
