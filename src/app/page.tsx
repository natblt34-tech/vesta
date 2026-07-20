import type { Metadata } from "next";
import Intro from "@/components/home/Intro";
import Hero from "@/components/home/Hero";
import HomeTimecode from "@/components/home/HomeTimecode";
import Manifeste from "@/components/home/Manifeste";
import Traversee from "@/components/home/Traversee";
import PleinEcran from "@/components/home/PleinEcran";
import NeufPhotos from "@/components/home/NeufPhotos";
import Offres from "@/components/home/Offres";
import PunchHome from "@/components/home/PunchHome";
import RendezVous from "@/components/chrome/RendezVous";

export const metadata: Metadata = {
  description:
    "Vesta transforme les photos d'un bien en film cinématique. La preuve : cette page est le film, scrollez. Génération IA, montage humain, livré en 72 h.",
};

export default function Home() {
  return (
    <main>
      <Intro />
      <HomeTimecode />
      <Hero />
      <Manifeste />
      <Traversee />
      <PleinEcran />
      <NeufPhotos />
      <Offres />
      <PunchHome />
      <RendezVous />
    </main>
  );
}
