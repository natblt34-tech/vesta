import type { Metadata } from "next";
import StagingScene from "@/components/staging/StagingScene";
import Punch from "@/components/Punch";
import RendezVous from "@/components/chrome/RendezVous";
import { MENTION_STAGING } from "@/lib/site";
import Ajuste from "@/components/Ajuste";

export const metadata: Metadata = {
  title: "Le home staging virtuel",
  description:
    "Home staging virtuel à Toulouse : la pièce vide se meuble sous vos yeux, élément par élément, pendant que vous scrollez. Visuels virtuellement aménagés, non contractuels.",
};

export default function HomeStaging() {
  return (
    <main>
      <header className="marge flex min-h-[60svh] flex-col justify-end pb-16 pt-32">
        <h1 className="voix-display" style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)" }}>
          <Ajuste>Le home staging</Ajuste>
        </h1>
        <p className="mt-6 max-w-md" style={{ color: "var(--color-gris-pierre)" }}>
          Un bien vide se vend mal : personne n&apos;achète des murs. En scrollant,
          vous allez meubler ce salon vous-même — c&apos;est exactement ce que voit
          un acheteur dans nos films.
        </p>
        <p className="voix-mono mt-8" style={{ color: "var(--color-bronze)" }}>
          SALON TÉMOIN · 6 ÉLÉMENTS · PUIS LA FLAMME
        </p>
      </header>
      <StagingScene />
      <Punch
        lignes={["LA PIÈCE ÉTAIT VIDE", "IL Y A TRENTE", "SECONDES."]}
        plan="DERNIÈRE IMAGE"
        sous={
          <p>
            Meublée élément par élément, réversible au scroll. {MENTION_STAGING}
          </p>
        }
      />
      <RendezVous mention={MENTION_STAGING} />
    </main>
  );
}
