import type { NextConfig } from "next";

/* Application Next.js complète (Vercel) : plus d'export statique, car
   l'espace client et les endpoints du pipeline ont besoin du serveur.
   Le rendu reste statique là où c'est possible ; les routes API et les
   parties authentifiées tournent côté serveur. */
const nextConfig: NextConfig = {
  images: {
    /* Photos servies depuis Supabase Storage via URLs signées. */
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
