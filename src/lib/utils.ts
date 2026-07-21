/* cn : concatène des classes conditionnelles. Version légère, sans dépendance. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
