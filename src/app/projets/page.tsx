import type { Metadata } from "next";
import GalerieProjets from "@/components/projets/GalerieProjets";

export const metadata: Metadata = {
  title: "Les projets",
  description:
    "Films immobiliers livrés par Vesta à Toulouse : chaque projet est une carte en orbite dans l'environnement 3D. Cliquez pour ouvrir la fiche du film, ses traversées et son brief.",
};

export default function Projets() {
  return (
    <main>
      <GalerieProjets />
    </main>
  );
}
