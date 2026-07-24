import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import GalerieProjets from "@/components/projets/GalerieProjets";

export const metadata: Metadata = {
  description:
    "Lares, studio vidéo immobilier partout en France. Nos films livrés flottent en orbite : cliquez un projet pour voir, sur un cas réel, la retouche photo, le home staging et l'animation vidéo. Le premier film est offert.",
  alternates: { canonical: `${SITE_URL}/` },
};

export default function Home() {
  return (
    <main>
      {/* Contenu sémantique pour les moteurs et les lecteurs d'écran :
         l'environnement 3D ne porte aucun texte indexable. */}
      <h1 className="sr-only">Lares, studio vidéo immobilier en France</h1>
      <p className="sr-only">
        Lares transforme les photos de vos biens en films cinématiques pour vos annonces immobilières :
        montage humain, retouche photo et home staging virtuel, livrés en 16:9 pour les portails et en
        9:16 pour les réseaux sociaux, partout en France. Le premier film est offert.
      </p>
      <GalerieProjets />
    </main>
  );
}
