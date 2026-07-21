"use client";

/* Notifications email. Aujourd'hui : simulées (journal navigateur, visibles
   dans l'espace démo). En prod : cette fonction appelle une route serveur
   qui déclenche Resend/Postmark.

   Les deux déclencheurs demandés :
   - nouveau-mandat  : email au studio Vesta à chaque nouvelle demande.
   - production-livree : email au client dès qu'une vidéo est déposée. */

export type Notification = {
  type: "nouveau-mandat" | "production-livree" | "aide";
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
