/* Constantes du site. */
export const CAL_URL = "https://cal.com/vesta-studio";
export const SITE_NAME = "Vesta";

/* Origine publique du site, basePath inclus. Pilotée par l'environnement :
   aujourd'hui GitHub Pages (sous /vesta), demain https://vesta-re.com sur
   Vercel (sans basePath). Une seule variable à définir au go-live :
   NEXT_PUBLIC_SITE_URL=https://vesta-re.com */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://natblt34-tech.github.io/vesta";

/* URL absolue d'un asset public (partage social, sitemap, canonical). */
export const absolu = (chemin: string) => `${SITE_URL}/${chemin.replace(/^\//, "")}`;

/* Image de partage par défaut : un film réellement livré. */
export const OG_IMAGE = absolu("media/avignon-poster.jpg");

export const MENTION_STAGING = "Visuels virtuellement aménagés, non contractuels.";
