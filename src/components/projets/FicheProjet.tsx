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
import DemoTraversee from "./DemoTraversee";
import StagingScene from "@/components/staging/StagingScene";
import Offres from "@/components/chrome/Offres";
import RendezVous from "@/components/chrome/RendezVous";
import { TransitionLink } from "@/components/chrome/Transition";

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
          date={`${projet.type} · ${projet.surface} M² · ${projet.quartier} · ${projet.photos} PHOTOS`}
          scrollToExpand="SCROLLEZ · LE FILM S'OUVRE"
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
              {projet.type} · {projet.surface} M² · {projet.quartier} · {projet.photos} PHOTOS FOURNIES
            </p>
          </div>
        </section>
      )}

      {/* CE QU'ON A FAIT SUR CE BIEN — les services démontrés. */}
      <section className="marge py-(--spacing-section)">
        <p className="voix-mono mb-4" style={{ color: "var(--color-bronze)" }}>
          CE QU&apos;ON A FAIT SUR CE BIEN
        </p>
        <h2
          className="voix-display max-w-3xl"
          style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
        >
          Vous venez de scroller le film. Voici comment il a été fabriqué, geste
          par geste.
        </h2>
      </section>

      {/* 01 · LA RETOUCHE */}
      {projet.retouche ? <DemoRetouche projet={projet} /> : null}

      {/* 02 · LE HOME STAGING (si le projet en a) */}
      {projet.staging ? (
        <StagingScene
          vide={projet.staging.vide}
          meuble={projet.staging.meuble}
          piece={projet.staging.piece}
        />
      ) : null}

      {/* 03 · L'ANIMATION VIDÉO — la traversée */}
      {projet.traversee ? <DemoTraversee projet={projet} /> : null}

      {/* LE BRIEF vs LE RÉSULTAT */}
      <section className="marge grid gap-12 py-(--spacing-section) md:grid-cols-2">
        <div>
          <h2 className="voix-mono mb-6" style={{ color: "var(--color-bronze)" }}>
            LE BRIEF · CE QUE L&apos;AGENCE A FOURNI
          </h2>
          {projet.briefPhotos ? (
            <div className="grid grid-cols-2 gap-2">
              {projet.briefPhotos.map((p) => (
                <img
                  key={p.src}
                  src={media(p.src)}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: Math.min(projet.photos, 9) }, (_, i) => (
                <div
                  key={i}
                  className="aspect-4/3"
                  style={{
                    backgroundImage: `url(${media(`${projet.image}.webp`)})`,
                    backgroundSize: "340%",
                    backgroundPosition: `${(i * 41) % 100}% ${(i * 67) % 100}%`,
                    filter: "brightness(0.6) saturate(0.5) contrast(0.85)",
                  }}
                  role="img"
                  aria-label={`Photo brute ${i + 1} fournie par l'agence`}
                />
              ))}
            </div>
          )}
          <p className="mt-6 max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
            {projet.brief}
          </p>
        </div>

        <div>
          <h2 className="voix-mono mb-6" style={{ color: "var(--color-bronze)" }}>
            LES TRAVERSÉES DU FILM
          </h2>
          <ul>
            {projet.traversees.map((t, i) => (
              <li
                key={t.nom}
                className="filet voix-mono flex items-baseline justify-between py-4"
                style={{ color: "var(--color-pierre)" }}
              >
                <span>
                  TRAVERSÉE {String(i + 1).padStart(2, "0")} · {t.nom}
                </span>
                <span style={{ color: "var(--color-gris-pierre)" }}>{t.duree} S</span>
              </li>
            ))}
          </ul>
          <h2 className="voix-mono mb-4 mt-12" style={{ color: "var(--color-bronze)" }}>
            LE RÉSULTAT
          </h2>
          <p className="max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
            {projet.resultat}
          </p>
          {projet.staging ? (
            <p className="voix-mono mt-8" style={{ color: "var(--color-gris-pierre)" }}>
              {MENTION_STAGING}
            </p>
          ) : null}
          <TransitionLink
            href="/"
            className="voix-mono mt-10 inline-block underline underline-offset-4"
            style={{ color: "var(--color-pierre)" }}
          >
            ← Tous les projets
          </TransitionLink>
        </div>
      </section>

      {/* LES OFFRES — la conversion, après la démonstration. */}
      <Offres />
      <RendezVous mention={projet.staging ? MENTION_STAGING : undefined} />
    </main>
  );
}
