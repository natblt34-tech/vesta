/* Constantes du site. */
export const CAL_URL = "https://calendly.com/nbellet-vesta-re/30min";
export const SITE_NAME = "Lares";

/* Origine publique du site. Pilotée par l'environnement (Vercel) :
   NEXT_PUBLIC_SITE_URL=https://lares-re.com */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lares-re.com";

/* URL absolue d'un asset public (partage social, sitemap, canonical). */
export const absolu = (chemin: string) => `${SITE_URL}/${chemin.replace(/^\//, "")}`;

/* Image de partage par défaut : un film réellement livré. */
export const OG_IMAGE = absolu("media/avignon-poster.jpg");

export const MENTION_STAGING = "Visuels virtuellement aménagés, non contractuels.";
