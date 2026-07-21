"use client";

import { useState } from "react";
import type { Mandat } from "@/lib/client/types";

const LIBELLE_STATUT: Record<Mandat["statut"], string> = {
  recu: "REÇU",
  "en-production": "EN PRODUCTION",
  livre: "FILM LIVRÉ",
};

/* Onglet « Mes productions » : la liste des mandats, puis le détail d'un
   mandat (photos déposées + vidéo livrée par le studio). */
export default function MesProductions({ mandats }: { mandats: Mandat[] }) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const mandat = mandats.find((m) => m.id === ouvert) ?? null;

  if (mandats.length === 0) {
    return (
      <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
        AUCUN MANDAT POUR L&apos;INSTANT. DÉPOSEZ VOTRE PREMIÈRE DEMANDE DEPUIS L&apos;ONGLET « NOUVELLE DEMANDE ».
      </p>
    );
  }

  if (mandat) {
    return (
      <div className="flex flex-col gap-8">
        <button
          type="button"
          onClick={() => setOuvert(null)}
          className="voix-mono self-start underline underline-offset-4"
          style={{ color: "var(--color-gris-pierre)" }}
        >
          ← Tous les mandats
        </button>

        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="voix-display" style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}>
            {mandat.nom}
          </h2>
          <span
            className="voix-mono"
            style={{ color: mandat.production ? "var(--color-braise-vive)" : "var(--color-bronze)" }}
          >
            {LIBELLE_STATUT[mandat.statut]}
          </span>
        </div>

        {mandat.description ? (
          <p style={{ color: "var(--color-gris-pierre)" }}>{mandat.description}</p>
        ) : null}

        {/* La vidéo produite */}
        <section className="flex flex-col gap-3">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            LE FILM
          </p>
          {mandat.production ? (
            <video
              src={mandat.production.url}
              controls
              playsInline
              className="w-full"
              style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
              onError={(e) => {
                (e.currentTarget as HTMLVideoElement).style.display = "none";
              }}
            />
          ) : (
            <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
              LE FILM EST EN COURS DE MONTAGE. VOUS SEREZ AVERTI PAR EMAIL DÈS SON DÉPÔT.
            </p>
          )}
        </section>

        {/* Les photos déposées */}
        <section className="flex flex-col gap-3">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            {mandat.photos.length} PHOTOS DÉPOSÉES · {mandat.connexions.length} CONNEXIONS
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {mandat.photos.map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt={p.nom}
                className="aspect-4/3 w-full object-cover"
                style={{ border: "1px solid var(--color-filet)" }}
              />
            ))}
          </div>
          {mandat.connexions.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {mandat.connexions.map((c, i) => (
                <li key={c.id} className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--color-bronze)" }}>CONNEXION {String(i + 1).padStart(2, "0")} · </span>
                  {c.description}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {mandats.map((m) => (
        <li key={m.id} style={{ borderTop: "1px solid var(--color-filet)" }}>
          <button
            type="button"
            onClick={() => setOuvert(m.id)}
            className="group flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 text-left"
          >
            <span
              className="voix-display transition-colors duration-200 group-hover:text-(--color-braise-vive)"
              style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
            >
              {m.nom}
            </span>
            <span
              className="voix-mono"
              style={{ color: m.production ? "var(--color-braise-vive)" : "var(--color-bronze)" }}
            >
              {m.photos.length} PHOTOS · {LIBELLE_STATUT[m.statut]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
