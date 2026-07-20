"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { media } from "@/lib/media";
import { TransitionLink } from "@/components/chrome/Transition";
import type { CartePlan } from "@/components/ui/3d-image-gallery";

/* La galerie 3D des plans, chargée côté client uniquement (three.js).
   Repli en grille sobre : mobile, reduced-motion, et le temps du chargement. */

const GaleriePlans = dynamic(() => import("@/components/ui/3d-image-gallery"), {
  ssr: false,
  loading: () => <ChargementGalerie />,
});

const CARTES: CartePlan[] = [
  { id: "1", imageUrl: media("visite-poster.jpg"), alt: "Salon haussmannien, cheminée et parquet chevron", title: "SALON · CÔTE PAVÉE", meta: "PLAN 01 · FILM 47 S", slug: "maison-cote-pavee" },
  { id: "2", imageUrl: media("brief-chambre.webp"), alt: "Chambre, lumière dorée de fin de journée", title: "CHAMBRE · CÔTE PAVÉE", meta: "PLAN 02 · PHOTO DU BRIEF", slug: "maison-cote-pavee" },
  { id: "3", imageUrl: media("brief-cuisine.webp"), alt: "Cuisine sauge, vue sur les toits de Toulouse", title: "CUISINE · CÔTE PAVÉE", meta: "PLAN 03 · PHOTO DU BRIEF", slug: "maison-cote-pavee" },
  { id: "4", imageUrl: media("brief-entree.webp"), alt: "Entrée en enfilade vers le séjour", title: "ENTRÉE · CÔTE PAVÉE", meta: "PLAN 04 · PHOTO DU BRIEF", slug: "maison-cote-pavee" },
  { id: "5", imageUrl: media("brief-salon.webp"), alt: "Salon, cheminée en marbre et miroir ancien", title: "CHEMINÉE · CÔTE PAVÉE", meta: "PLAN 05 · PHOTO DU BRIEF", slug: "maison-cote-pavee" },
  { id: "6", imageUrl: media("cuisine-porte.webp"), alt: "Traversée vers la cuisine, perspective centrale", title: "TRAVERSÉE · SAINT-AUBIN", meta: "PLAN 06 · TRAVERSÉE 6 S", slug: "t3-saint-aubin" },
  { id: "7", imageUrl: media("salon-apres.webp"), alt: "Séjour au soir, brique et lumière rasante", title: "SÉJOUR · SAINT-AUBIN", meta: "PLAN 07 · FILM 52 S", slug: "t3-saint-aubin" },
  { id: "8", imageUrl: media("salon-meuble.webp"), alt: "Séjour habité, lampes allumées", title: "SÉJOUR · CARMES", meta: "PLAN 08 · FILM 38 S", slug: "appartement-carmes" },
  { id: "9", imageUrl: media("salon-vide.webp"), alt: "Pièce vide avant home staging", title: "AVANT STAGING · CARMES", meta: "PLAN 09 · HOME STAGING", slug: "appartement-carmes" },
];

function ChargementGalerie() {
  return (
    <div className="flex h-svh items-center justify-center" style={{ background: "var(--color-basalte)" }}>
      <span className="braise-point" aria-hidden="true" />
    </div>
  );
}

function GrilleStatique() {
  return (
    <div className="marge grid grid-cols-2 gap-2 py-10 md:grid-cols-3">
      {CARTES.map((c) => (
        <TransitionLink key={c.id} href={`/projets/${c.slug}`} className="group block">
          <img src={c.imageUrl} alt={c.alt} loading="lazy" className="aspect-4/3 w-full object-cover" />
          <p className="voix-mono mt-2 truncate" style={{ color: "var(--color-gris-pierre)" }}>
            {c.title}
          </p>
        </TransitionLink>
      ))}
    </div>
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

  return (
    <section aria-label="Galerie des plans">
      <h2 className="voix-mono marge filet pb-6 pt-10" style={{ color: "var(--color-bronze)" }}>
        LA GALERIE · TOUS LES PLANS DES FILMS LIVRÉS
      </h2>
      {reduced || !large ? <GrilleStatique /> : <GaleriePlans cards={CARTES} />}
    </section>
  );
}
