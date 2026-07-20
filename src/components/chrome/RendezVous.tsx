import { CAL_URL } from "@/lib/site";
import Ajuste from "@/components/Ajuste";

/* L'unique CTA du site, en fin de chaque page. */
export default function RendezVous({ mention }: { mention?: string }) {
  return (
    <footer className="marge filet flex flex-col gap-10 py-16">
      <div className="flex flex-col gap-6">
        <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
          Chaque offre inclut le premier film : Étincelle · Flamme · Brasier
        </p>
        <a
          href={CAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="voix-display group inline-flex flex-wrap items-baseline gap-x-6"
          style={{ fontSize: "var(--text-titre)", color: "var(--page-fg)" }}
        >
          <span className="braise-point self-center" aria-hidden="true" />
          <Ajuste className="underline decoration-1 underline-offset-8 transition-colors duration-200 group-hover:text-(--color-braise-vive)">
            Prendre rendez-vous
          </Ajuste>
          <span className="voix-mono" style={{ color: "var(--page-fg-2)" }}>
            15 min · sans engagement
          </span>
        </a>
      </div>

      <div
        className="voix-mono flex flex-wrap items-baseline justify-between gap-4"
        style={{ color: "var(--page-fg-2)" }}
      >
        <span>VESTA · Studio vidéo immobilier · Toulouse</span>
        {mention ? <span>{mention}</span> : null}
        <span>Films générés par IA · montés à la main</span>
      </div>
    </footer>
  );
}
