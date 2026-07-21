import type { Metadata } from "next";
import GalerieProjets from "@/components/projets/GalerieProjets";

export const metadata: Metadata = {
  description:
    "Vesta, studio vidéo immobilier à Toulouse. Nos films livrés flottent en orbite : cliquez un projet pour voir, sur un cas réel, la retouche photo, le home staging et l'animation vidéo. Le premier film est offert.",
};

export default function Home() {
  return (
    <main>
      <GalerieProjets />
    </main>
  );
}
