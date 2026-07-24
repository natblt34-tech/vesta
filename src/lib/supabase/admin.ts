import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/* Client Supabase privilégié (clé secrète). Contourne le RLS : à n'utiliser
   QUE côté serveur, pour les opérations que le RLS interdit à l'utilisateur
   courant (invitations, changement de statut, dépôt de livrables, pipeline).
   Ne jamais l'importer dans un composant client. */
export function supabaseAdmin(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
