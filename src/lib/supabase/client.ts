"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/* Client Supabase côté navigateur (clé publique). La session est portée
   par des cookies, lus aussi côté serveur. Singleton : un seul par onglet. */
let instance: SupabaseClient | null = null;

export function supabaseNavigateur(): SupabaseClient {
  if (instance) return instance;
  instance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return instance;
}
