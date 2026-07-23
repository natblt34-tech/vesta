/* Nommage des pièces : la clé d'entrée du pipeline. Noms courts, sans
   accent ni espace, suffixe numérique automatique en cas de doublon. */

export const PIECES_SUGGEREES = [
  "sejour",
  "cuisine",
  "chambre",
  "entree",
  "couloir",
  "balcon",
  "sdb",
  "wc",
  "bureau",
  "terrasse",
  "exterieur",
];

/* sejour, Séjour 1, SÉJOUR-1 -> sejour1 */
export function normaliserPiece(brut: string): string {
  return brut
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/* Base sans le suffixe numérique : sejour2 -> sejour. */
export function basePiece(nom: string): string {
  return normaliserPiece(nom).replace(/\d+$/, "");
}

/* Premier nom libre pour cette base parmi les noms déjà pris :
   sejour -> sejour1, puis sejour2… */
export function suffixerPiece(base: string, pris: string[]): string {
  const b = basePiece(base) || "piece";
  const occupe = new Set(pris);
  let n = 1;
  while (occupe.has(`${b}${n}`)) n += 1;
  return `${b}${n}`;
}

/* Assainit une saisie manuelle : normalise, et re-suffixe si le nom
   exact est déjà pris par une autre photo. */
export function assainirPiece(brut: string, prisAilleurs: string[]): string {
  const propre = normaliserPiece(brut);
  if (!propre) return "";
  if (!prisAilleurs.includes(propre)) return propre;
  return suffixerPiece(propre, prisAilleurs);
}

/* Liste des pièces distinctes (par nom exact) d'un lot de photos nommées. */
export function piecesDistinctes(noms: string[]): string[] {
  return [...new Set(noms.filter(Boolean))];
}
