"use client";

import { useSyncExternalStore } from "react";
import { getServerStatus, getStatus, subscribeStatus } from "@/lib/status";

/* L'overlay dynamique haut de page (réf. analogueagency) :
   l'état courant du scroll, dans le vocabulaire du métier.
   VESTA à gauche, statut centré — la zone droite appartient au bouton MENU. */
export default function StatusOverlay() {
  const status = useSyncExternalStore(subscribeStatus, getStatus, getServerStatus);

  return (
    <div
      className="voix-mono pointer-events-none fixed inset-x-0 top-0 z-90 h-10"
      style={{ color: "var(--page-fg-2)" }}
      aria-hidden="true"
    >
      <span
        className="absolute left-[var(--spacing-marge)] top-3"
        style={{ color: "var(--page-fg)" }}
      >
        VESTA
      </span>
      <span
        className="absolute left-1/2 top-3 max-w-[52vw] -translate-x-1/2 truncate"
        aria-live="off"
      >
        {status}
      </span>
    </div>
  );
}
