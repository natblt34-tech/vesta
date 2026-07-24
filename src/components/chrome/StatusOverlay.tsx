"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { getServerStatus, getStatus, subscribeStatus } from "@/lib/status";
import Logo from "./Logo";

/* Routes du portail client : elles portent leur propre chrome (coquille
   applicative, pages de connexion) — l'overlay du site vitrine s'efface. */
const ROUTES_PORTAIL = ["/espace", "/studio", "/connexion", "/creer-acces"];

/* L'overlay dynamique haut de page (réf. analogueagency) :
   le logo cliquable à gauche, l'état courant du scroll au centre.
   Sur la home, le logo central 3D suffit : on masque celui-ci pour
   éviter la répétition. */
export default function StatusOverlay() {
  const status = useSyncExternalStore(subscribeStatus, getStatus, getServerStatus);
  const pathname = usePathname();
  const surHome = pathname === "/";
  if (ROUTES_PORTAIL.some((r) => pathname.startsWith(r))) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-90 h-10">
      {!surHome ? (
        <span className="absolute left-[var(--spacing-marge)] top-2.5">
          <Logo />
        </span>
      ) : null}
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
