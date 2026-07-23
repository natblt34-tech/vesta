"use client";

/* Notifications email. Aujourd'hui : simulées (journal navigateur, visibles
   en console). En prod : cette fonction appelle une route serveur qui
   déclenche Resend/Postmark. Jamais de fichier en pièce jointe : les emails
   pointent vers l'espace client.

   Déclencheurs :
   - nouvelle-demande   : au studio Vesta à chaque dépôt.
   - livraison          : au client quand le job passe à `livre` (« Votre film est prêt »).
   - complement-demande : au client quand le job passe à `attention_requise`.
   - complement-reponse : au studio quand le client répond.
   - aide               : au studio depuis la bulle d'aide. */

export type Notification = {
  type: "nouvelle-demande" | "livraison" | "complement-demande" | "complement-reponse" | "aide";
  destinataire: string;
  sujet: string;
  corps: string;
  envoyeeLe?: number;
};

const CLE = "vesta-notifications";

export async function notifier(n: Omit<Notification, "envoyeeLe">): Promise<void> {
  const entry: Notification = { ...n, envoyeeLe: Date.now() };

  // TODO backend : remplacer par
  //   await fetch("/api/notify", { method: "POST", body: JSON.stringify(entry) })
  // qui côté serveur appelle Resend.emails.send(...).
  if (typeof window !== "undefined") {
    try {
      const journal = JSON.parse(window.localStorage.getItem(CLE) || "[]") as Notification[];
      journal.unshift(entry);
      window.localStorage.setItem(CLE, JSON.stringify(journal.slice(0, 50)));
    } catch {
      /* ignore */
    }
    // Trace visible pour la démo.
    console.info(`[Vesta · email simulé → ${entry.destinataire}] ${entry.sujet}`);
  }
}

export function journalNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(CLE) || "[]") as Notification[];
  } catch {
    return [];
  }
}
