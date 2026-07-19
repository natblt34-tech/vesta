/* Préfixe des assets publics. Sur GitHub Pages le site vit sous /vesta :
   le workflow de déploiement définit NEXT_PUBLIC_BASE_PATH=/vesta.
   En local et sur Vercel, la racine. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function media(fichier: string) {
  return `${BASE_PATH}/media/${fichier}`;
}
