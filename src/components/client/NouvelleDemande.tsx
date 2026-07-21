"use client";

import { useState } from "react";
import { backend } from "@/lib/client/backend";
import { importerPhoto } from "@/lib/client/media";
import type { Connexion, PhotoRef } from "@/lib/client/types";
import Champ from "./Champ";
import Connexions from "./Connexions";

/* Onglet « Nouvelle demande » : nom du mandat, description, dépôt de
   photos, connexions entre photos, envoi. */
export default function NouvelleDemande({ onEnvoye }: { onEnvoye: () => void }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoRef[]>([]);
  const [connexions, setConnexions] = useState<Connexion[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const ajouterPhotos = async (files: FileList | null) => {
    if (!files) return;
    setErreur("");
    try {
      const nouvelles = await Promise.all(Array.from(files).map(importerPhoto));
      setPhotos((p) => [...p, ...nouvelles]);
    } catch {
      setErreur("Une image n'a pas pu être importée.");
    }
  };

  const retirerPhoto = (pid: string) => {
    setPhotos((p) => p.filter((x) => x.id !== pid));
    setConnexions((c) => c.filter((x) => x.photoA !== pid && x.photoB !== pid));
  };

  const envoyer = async () => {
    if (!nom.trim() || photos.length === 0) {
      setErreur("Donnez un nom au mandat et déposez au moins une photo.");
      return;
    }
    setEnCours(true);
    try {
      await backend.creerMandat({ nom: nom.trim(), description: description.trim(), photos, connexions });
      onEnvoye();
    } catch {
      setErreur("Envoi impossible.");
      setEnCours(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
            NOM DU MANDAT
          </span>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : T4 terrasse, Pech David"
            className="w-full bg-transparent px-3 py-3 outline-none focus-visible:border-(--color-bronze)"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
            DESCRIPTION DU BIEN
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Quelques mots : type de bien, ambiance recherchée, points forts…"
            className="w-full resize-none bg-transparent px-3 py-3 outline-none focus-visible:border-(--color-bronze)"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          />
        </label>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            LES PHOTOS DU BIEN
          </p>
          <label
            className="voix-mono cursor-pointer px-4 py-2"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          >
            + Ajouter des photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => ajouterPhotos(e.target.files)}
            />
          </label>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p) => (
              <div key={p.id} className="relative aspect-4/3 overflow-hidden" style={{ border: "1px solid var(--color-filet)" }}>
                <img src={p.url} alt={p.nom} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => retirerPhoto(p.id)}
                  aria-label="Retirer la photo"
                  className="voix-mono absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: "var(--color-basalte)", color: "var(--color-pierre)", fontSize: "0.65rem" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
            AUCUNE PHOTO POUR L&apos;INSTANT
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
          LES CONNEXIONS ENTRE PHOTOS
        </p>
        <Connexions photos={photos} connexions={connexions} setConnexions={setConnexions} />
      </section>

      {erreur ? (
        <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
          {erreur}
        </p>
      ) : null}

      <button
        type="button"
        onClick={envoyer}
        disabled={enCours}
        className="voix-mono inline-flex items-center justify-center gap-3 self-start px-8 py-4 transition-colors duration-200 hover:border-(--color-braise-vive) disabled:opacity-60"
        style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
      >
        <span className="braise-point" aria-hidden="true" />
        {enCours ? "Envoi…" : "Envoyer la demande"}
      </button>
    </div>
  );
}
