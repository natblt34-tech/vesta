import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PROJETS } from "@/lib/projets";

/* Requis par l'export statique (output: export). */
export const dynamic = "force-static";

/* Plan du site : uniquement les pages publiques. Le portail client
   (espace, studio, connexion) est en noindex et absent d'ici. */
export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: maj, changeFrequency: "monthly", priority: 1 },
    ...PROJETS.map((p) => ({
      url: `${SITE_URL}/projets/${p.slug}/`,
      lastModified: maj,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
