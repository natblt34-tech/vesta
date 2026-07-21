"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { setStatus } from "@/lib/status";
import LenisProvider from "./LenisProvider";
import Cursor from "./Cursor";
import ScrollProgress from "./ScrollProgress";
import StatusOverlay from "./StatusOverlay";
import { TransitionProvider } from "./Transition";

/* Assemble le chrome transverse. Remet les variables de page à zéro
   à chaque navigation (la retouche les fait dériver). */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-bg", "var(--color-basalte)");
    root.style.setProperty("--page-fg", "var(--color-pierre)");
    root.style.setProperty("--page-fg-2", "var(--color-gris-pierre)");
    root.style.setProperty("--page-filet", "var(--color-filet)");
    setStatus("");
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <TransitionProvider>
      <LenisProvider />
      <ScrollProgress />
      <StatusOverlay />
      <a
        href="#contenu"
        className="voix-mono fixed left-4 top-3 z-99 -translate-y-16 bg-(--color-basalte-2) px-3 py-2 focus-visible:translate-y-0"
        style={{ color: "var(--color-pierre)", transition: "translate 0.2s" }}
      >
        Aller au contenu
      </a>
      <div id="contenu">{children}</div>
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </TransitionProvider>
  );
}
