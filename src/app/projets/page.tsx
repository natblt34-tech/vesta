import type { Metadata } from "next";
import IndexProjets from "@/components/projets/IndexProjets";
import GalerieProjets from "@/components/projets/GalerieProjets";
import RendezVous from "@/components/chrome/RendezVous";
import Ajuste from "@/components/Ajuste";
import FragmentVesta from "@/components/vesta/FragmentVesta";

export const metadata: Metadata = {
  title: "Les projets",
  description:
    "Films immobiliers livrés par Vesta à Toulouse : à partir de 8 à 11 photos, des films de 38 à 52 secondes avec traversées. L'index des projets.",
};

export default function Projets() {
  return (
    <main>
      <header className="marge relative flex flex-col justify-end pb-8 pt-32">
        <div className="absolute right-[2vw] top-24 hidden w-[10vw] max-w-36 lg:block">
          <FragmentVesta variant="vesta" miroir />
        </div>
        <h1 className="voix-display" style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)" }}>
          <Ajuste>Les projets</Ajuste>
        </h1>
        <p className="voix-mono mt-6" style={{ color: "var(--color-bronze)" }}>
          CE QUE L&apos;AGENCE A FOURNI · CE QUE L&apos;ACHETEUR A VU
        </p>
      </header>
      <IndexProjets />
      <GalerieProjets />
      <RendezVous />
    </main>
  );
}
