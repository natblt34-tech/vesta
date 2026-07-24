import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* Requis par l'export statique (output: export). */
export const dynamic = "force-static";

/* Crawl autorisé sur le site vitrine, interdit sur le portail client
   (données privées). Le sitemap pointe vers les pages publiques. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/espace/", "/vesta-studio/", "/connexion/", "/creer-acces/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
