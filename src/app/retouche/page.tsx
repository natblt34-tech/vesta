import type { Metadata } from "next";
import {
  Fenetre,
  HeroBrut,
  Histogramme,
  Serie,
  Wipe,
} from "@/components/retouche/RetoucheExperience";
import Punch from "@/components/Punch";
import RendezVous from "@/components/chrome/RendezVous";

export const metadata: Metadata = {
  title: "La retouche photo",
  description:
    "Retouche photo pour annonces immobilières : exposition, ciels, verticales, colorimétrie. En scrollant cette page, c'est vous qui tenez le curseur avant/après.",
};

export default function Retouche() {
  return (
    <main>
      <HeroBrut />
      <Wipe />
      <Histogramme />
      <Fenetre />
      <Serie />
      <Punch
        lignes={["VOUS N'AVEZ PAS", "REGARDÉ LA PHOTO.", "VOUS L'AVEZ", "RETOUCHÉE."]}
        plan="DERNIÈRE IMAGE"
        sous={<p>Chaque photo de l&apos;annonce, au même niveau. Livraison 48 h.</p>}
      />
      <RendezVous />
    </main>
  );
}
