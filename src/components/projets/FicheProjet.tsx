"use client";

import { useEffect, useRef } from "react";
import type { Projet } from "@/lib/projets";
import { setStatus } from "@/lib/status";
import { media } from "@/lib/media";
import { MENTION_STAGING } from "@/lib/site";
import { useFitText } from "@/lib/useFitText";
import { useReducedMotion } from "@/lib/useReducedMotion";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import DemoRetouche from "./DemoRetouche";
import DemoAvantApres from "./DemoAvantApres";
import DemoStaging from "./DemoStaging";
import DemoFormats from "./DemoFormats";
import StagingScene from "@/components/staging/StagingScene";
import { FooterVesta } from "@/components/ui/motion-footer";
import Ajuste from "@/components/Ajuste";

/* La fiche projet est la démonstration complète par l'exemple :
   ce qu'on a fait sur CE bien, service par service (retouche, home
   staging s'il y en a, animation vidéo), puis le brief, le résultat,
   les offres et le rendez-vous. Le hero est le film livré. */
export default function FicheProjet({ projet }: { projet: Projet }) {
  const racine = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useFitText(racine);

  useEffect(() => {
    setStatus(`${projet.titre.toUpperCase()} · ${projet.duree} S`);
  }, [projet]);

  const heroFilm = projet.video && !reduced;

  return (
    <main ref={racine}>
      {/* HERO — le film livré, qui se déploie sous le scroll. */}
      {heroFilm ? (
        <ScrollExpandMedia
          mediaType="video"
          mediaSrc={media(projet.video!)}
          posterSrc={projet.poster ? media(projet.poster) : undefined}
          bgImageSrc={projet.poster ? media(projet.poster) : media(`${projet.image}.webp`)}
          title={projet.titre}
          date={`${projet.photos} PHOTOS · ${projet.duree} S`}
        />
      ) : (
        <section className="relative flex h-[86svh] items-end overflow-hidden">
          <img
            src={media(`${projet.image}.webp`)}
            alt={`Image du film ${projet.titre}`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: projet.posPlate }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "linear-gradient(rgba(18,21,26,0.1) 40%, rgba(18,21,26,0.72))" }}
          />
          <div className="relative z-1 w-full p-[var(--spacing-marge)] pb-12">
            <p className="voix-mono mb-3" style={{ color: "var(--color-braise-vive)" }}>
              FILM LIVRÉ · {projet.duree} S
            </p>
            <h1
              data-fit
              className="voix-display w-fit whitespace-nowrap"
              style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)" }}
            >
              {projet.titre}
            </h1>
            <p className="voix-mono mt-4" style={{ color: "var(--color-pierre)" }}>
              {projet.photos} PHOTOS FOURNIES
            </p>
          </div>
        </section>
      )}

      {/* La retouche — comparateur à curseur, ou wipe sur photo unique */}
      {projet.retouches ? (
        <DemoAvantApres retouches={projet.retouches} />
      ) : projet.retouche ? (
        <DemoRetouche projet={projet} />
      ) : null}

      {/* Le home staging — vidéo (Avignon) ou séquence d'images */}
      {projet.stagingVideo ? <DemoStaging projet={projet} /> : null}
      {projet.staging ? (
        <StagingScene
          vide={projet.staging.vide}
          meuble={projet.staging.meuble}
          piece={projet.staging.piece}
        />
      ) : null}

      {/* L'animation vidéo, livrée en 16:9 et 9:16 */}
      <DemoFormats projet={projet} />

      {/* Le brief, le résultat. */}
      <section className="marge grid items-center gap-14 py-(--spacing-section) md:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {(projet.briefPhotos ?? []).map((p) => (
            <img
              key={p.src}
              src={media(p.src)}
              alt={p.alt}
              loading="lazy"
              className="aspect-4/3 w-full object-cover"
            />
          ))}
        </div>

        <div>
          <h2
            className="voix-display"
            style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)", lineHeight: 0.95 }}
          >
            <Ajuste>{projet.photos} photos.</Ajuste>
            <Ajuste>{projet.duree} secondes.</Ajuste>
          </h2>
          <p className="mt-8 max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
            {projet.resultat}
          </p>
          {projet.staging ? (
            <p className="voix-mono mt-8" style={{ color: "var(--color-gris-pierre)" }}>
              {MENTION_STAGING}
            </p>
          ) : null}
        </div>
      </section>

      <FooterVesta />
    </main>
  );
}
