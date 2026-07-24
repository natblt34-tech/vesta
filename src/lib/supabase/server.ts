import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/* Client Supabase côté serveur (routes API, composants serveur). Lit la
   session de l'utilisateur depuis les cookies : les requêtes sont donc
   soumises au RLS au nom de cet utilisateur. */
export async function supabaseServeur(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(liste) {
          try {
            liste.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            /* Appelé depuis un composant serveur : rien à faire, le
               rafraîchissement de session est géré au niveau du middleware. */
          }
        },
      },
    },
  );
}
