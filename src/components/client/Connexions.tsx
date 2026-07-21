"use client";

import { useState } from "react";
import type { Connexion, PhotoRef } from "@/lib/client/types";

/* L'interface ludique des connexions : le client sélectionne deux photos,
   une bulle s'ouvre, il décrit ce qui les relie (le principe des
   traversées). Chaque lien apparaît ensuite comme une puce. */
export default function Connexions({
  photos,
  connexions,
  setConnexions,
}: {
  photos: PhotoRef[];
  connexions: Connexion[];
  setConnexions: (c: Connexion[]) => void;
}) {
  const [selection, setSelection] = useState<string[]>([]);
  const [texte, setTexte] = useState("");

  const paireComplete = selection.length === 2;

  const cliquer = (pid: string) => {
    if (selection.includes(pid)) {
      setSelection(selection.filter((x) => x !== pid));
      return;
    }
    if (selection.length < 2) setSelection([...selection, pid]);
  };

  const valider = () => {
    if (!paireComplete || !texte.trim()) return;
    setConnexions([
      ...connexions,
      { id: Math.random().toString(36).slice(2, 8), photoA: selection[0], photoB: selection[1], description: texte.trim() },
    ]);
    setSelection([]);
    setTexte("");
  };

  const nomPhoto = (pid: string) => photos.find((p) => p.id === pid)?.nom ?? "photo";

  if (photos.length < 2) {
    return (
      <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
        DÉPOSEZ AU MOINS DEUX PHOTOS POUR CRÉER UNE CONNEXION
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
        SÉLECTIONNEZ DEUX PHOTOS QUI SE SUIVENT DANS LA VISITE, PUIS DÉCRIVEZ LE PASSAGE ENTRE ELLES.
      </p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p) => {
          const rang = selection.indexOf(p.id);
          const actif = rang >= 0;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => cliquer(p.id)}
              className="relative aspect-4/3 overflow-hidden"
              style={{
                outline: actif ? "2px solid var(--color-braise-vive)" : "1px solid var(--color-filet)",
                outlineOffset: "-1px",
              }}
            >
              <img src={p.url} alt={p.nom} className="h-full w-full object-cover" />
              {actif ? (
                <span
                  className="voix-mono absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: "var(--color-braise)", color: "var(--color-pierre)", fontSize: "0.6rem" }}
                >
                  {rang === 0 ? "A" : "B"}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {paireComplete ? (
        <div className="flex flex-col gap-3 p-4" style={{ border: "1px solid var(--color-braise)", background: "var(--color-basalte-2)" }}>
          <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
            A → B · EN QUOI SONT-ELLES RELIÉES ?
          </p>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={2}
            autoFocus
            placeholder="Ex : on sort du salon et on entre dans la cuisine par cette porte."
            className="w-full resize-none bg-transparent p-3 outline-none"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={valider}
              disabled={!texte.trim()}
              className="voix-mono px-4 py-2 disabled:opacity-50"
              style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
            >
              Ajouter la connexion
            </button>
            <button
              type="button"
              onClick={() => setSelection([])}
              className="voix-mono px-4 py-2"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-gris-pierre)" }}
            >
              Annuler
            </button>
          </div>
        </div>
      ) : null}

      {connexions.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {connexions.map((c, i) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-3 py-2"
              style={{ borderTop: "1px solid var(--color-filet)" }}
            >
              <span className="voix-mono" style={{ color: "var(--color-pierre)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--color-bronze)" }}>CONNEXION {String(i + 1).padStart(2, "0")} · </span>
                {nomPhoto(c.photoA)} → {nomPhoto(c.photoB)}
                <span style={{ color: "var(--color-gris-pierre)" }}> · {c.description}</span>
              </span>
              <button
                type="button"
                onClick={() => setConnexions(connexions.filter((x) => x.id !== c.id))}
                aria-label="Retirer"
                className="voix-mono shrink-0"
                style={{ color: "var(--color-gris-pierre)" }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
