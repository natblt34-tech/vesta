"use client";

import { useSyncExternalStore } from "react";
import { getServerStatus, getStatus, subscribeStatus } from "@/lib/status";
import Logo from "./Logo";

/* L'overlay dynamique haut de page (réf. analogueagency) :
   le logo cliquable à gauche, l'état courant du scroll au centre,
   la zone droite appartient au bouton MENU. */
export default function StatusOverlay() {
  const status = useSyncExternalStore(subscribeStatus, getStatus, getServerStatus);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-90 h-10">
      <span className="absolute left-[var(--spacing-marge)] top-2.5">
        <Logo />
      </span>
      <span
        className="voix-mono absolute left-1/2 top-3 max-w-[52vw] -translate-x-1/2 truncate"
        style={{ color: "var(--page-fg-2)" }}
        aria-hidden="true"
      >
        {status}
      </span>
    </div>
  );
}
