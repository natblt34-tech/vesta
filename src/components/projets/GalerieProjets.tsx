"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import { setStatus } from "@/lib/status";
import { PROJETS } from "@/lib/projets";
import { TransitionLink } from "@/components/chrome/Transition";
import type { CarteProjet } from "@/components/ui/3d-image-gallery";

/* La galerie 3D EST la page projets : une carte par film livré,
   clic direct vers la fiche. Chargée côté client uniquement (three.js).
   Repli en liste sobre : mobile, reduced-motion, et le temps du chargement. */

const GaleriePlans = dynamic(() => import("@/components/ui/3d-image-gallery"), {
  ssr: false,
  loading: () => <ChargementGalerie />,
});

const CARTES: CarteProjet[] = PROJETS.map((p) => ({
  slug: p.slug,
  imageUrl: media(p.poster ?? `${p.image}.webp`),
  alt: `Extrait du film — ${p.titre}`,
  titre: p.titre,
  meta: `${p.type} · ${p.surface} M² · ${p.quartier} · ${p.photos} PHOTOS · ${p.traversees.length} TRAVERSÉE${p.traversees.length > 1 ? "S" : ""} · ${p.duree} S`,
}));

function ChargementGalerie() {
  return (
    <div
      className="flex h-svh items-center justify-center"
      style={{ background: "var(--color-basalte)" }}
    >
      <span className="braise-point" aria-hidden="true" />
    </div>
  );
}

/* Repli : la liste typographique, une entrée par projet. */
function ListeStatique() {
  return (
    <ul className="marge py-6">
      {CARTES.map((c) => (
        <li key={c.slug} className="filet">
          <TransitionLink href={`/projets/${c.slug}`} className="group block py-6">
            <img
              src={c.imageUrl}
              alt={c.alt}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
            <span className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <span
                className="voix-display transition-colors duration-200 group-hover:text-(--color-braise-vive)"
                style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
              >
                {c.titre}
              </span>
              <span className="voix-mono" style={{ color: "var(--color-bronze)" }}>
                {c.meta}
              </span>
            </span>
          </TransitionLink>
        </li>
      ))}
    </ul>
  );
}

function useEstLarge() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
}

export default function GalerieProjets() {
  const reduced = useReducedMotion();
  const large = useEstLarge();

  useEffect(() => {
    setStatus(`${PROJETS.length} FILMS LIVRÉS · EN ORBITE`);
  }, []);

  return (
    <section aria-label="Les projets — galerie">
      {reduced || !large ? <ListeStatique /> : <GaleriePlans cartes={CARTES} />}
    </section>
  );
}
