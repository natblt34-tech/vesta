"use client";

import { useSyncExternalStore } from "react";
import { getServerStatus, getStatus, subscribeStatus } from "@/lib/status";

/* L'overlay dynamique haut de page (réf. analogueagency) :
   l'état courant du scroll, dans le vocabulaire du métier. */
export default function StatusOverlay() {
  const status = useSyncExternalStore(subscribeStatus, getStatus, getServerStatus);

  return (
    <div
      className="voix-mono marge pointer-events-none fixed inset-x-0 top-0 z-90 flex items-baseline justify-between py-3"
      style={{ color: "var(--page-fg-2)" }}
      aria-hidden="true"
    >
      <span style={{ color: "var(--page-fg)" }}>VESTA</span>
      <span aria-live="off">{status}</span>
    </div>
  );
}
