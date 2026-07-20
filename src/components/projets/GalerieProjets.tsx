"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import { setStatus } from "@/lib/status";
import { CAL_URL } from "@/lib/site";
import { PROJETS } from "@/lib/projets";
import { TransitionLink } from "@/components/chrome/Transition";
import RendezVous from "@/components/chrome/RendezVous";
import type { CarteProjet } from "@/components/ui/3d-image-gallery";

/* La page projets EST l'environnement 3D : plein écran d'entrée,
   titre et CTA en surimpression, aucune section scrollable au-dessus.
   Repli mobile / reduced-motion : liste sobre + CTA classiques. */

const GaleriePlans = dynamic(() => import("@/components/ui/3d-image-gallery"), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "var(--color-basalte)" }}
    >
      <span className="braise-point" aria-hidden="true" />
    </div>
  ),
});

const CARTES: CarteProjet[] = PROJETS.map((p) => ({
  slug: p.slug,
  imageUrl: media(p.poster ?? `${p.image}.webp`),
  alt: `Extrait du film ${p.titre}`,
  titre: p.titre,
  meta: `${p.type} · ${p.surface} M² · ${p.quartier} · ${p.photos} PHOTOS · ${p.traversees.length} TRAVERSÉE${p.traversees.length > 1 ? "S" : ""} · ${p.duree} S`,
}));

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
  const environnement = large && !reduced;

  useEffect(() => {
    setStatus(`${PROJETS.length} FILMS LIVRÉS · EN ORBITE`);
  }, []);

  if (!environnement) {
    return (
      <>
        <header className="marge flex flex-col justify-end pb-4 pt-28">
          <h1
            className="voix-display"
            style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)" }}
          >
            Les projets
          </h1>
          <p className="voix-mono mt-4" style={{ color: "var(--color-bronze)" }}>
            CE QUE L&apos;AGENCE A FOURNI · CE QUE L&apos;ACHETEUR A VU
          </p>
        </header>
        <ListeStatique />
        <RendezVous />
      </>
    );
  }

  return (
    <section
      aria-label="Les projets, environnement 3D"
      className="relative h-svh w-full overflow-hidden"
    >
      <GaleriePlans cartes={CARTES} />

      {/* Surimpressions : le titre, la consigne, l'unique CTA. */}
      <div className="pointer-events-none absolute left-[var(--spacing-marge)] top-16 z-10">
        <h1
          className="voix-display"
          style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
        >
          Les projets
        </h1>
        <p className="voix-mono mt-3" style={{ color: "var(--color-bronze)" }}>
          CE QUE L&apos;AGENCE A FOURNI · CE QUE L&apos;ACHETEUR A VU
        </p>
      </div>

      <p
        className="voix-mono pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center"
        style={{ color: "var(--color-gris-pierre)" }}
      >
        GLISSEZ POUR ORBITER · MOLETTE POUR ZOOMER · CLIQUEZ UN PROJET
      </p>

      <a
        href={CAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="voix-mono absolute bottom-6 right-[var(--spacing-marge)] z-10 inline-flex items-center gap-2 border px-4 py-3 transition-colors duration-200 hover:border-(--color-braise-vive)"
        style={{
          borderColor: "var(--color-filet)",
          color: "var(--color-pierre)",
          background: "color-mix(in srgb, var(--color-basalte) 72%, transparent)",
        }}
      >
        <span className="braise-point" aria-hidden="true" />
        Prendre rendez-vous
      </a>
    </section>
  );
}
