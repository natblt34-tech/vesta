"use client";

import { useState } from "react";
import { backend } from "@/lib/client/backend";
import { importerPhoto } from "@/lib/client/media";
import {
  couleurStatus,
  LIBELLE_LIVRABLE,
  LIBELLE_STATUS,
  type Job,
  type JobPhoto,
} from "@/lib/client/types";

function dateCourte(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/* Réponse à un « Complément demandé » : texte et/ou photos supplémentaires. */
function ReponseComplement({ job, onRepondu }: { job: Job; onRepondu: () => void }) {
  const [texte, setTexte] = useState("");
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const ajouter = async (files: FileList | null) => {
    if (!files) return;
    try {
      const nouvelles = await Promise.all(Array.from(files).map(importerPhoto));
      setPhotos((p) => [...p, ...nouvelles.map((n) => ({ room: n.nomFichier, url: n.url }))]);
    } catch {
      setErreur("Une image n'a pas pu être importée.");
    }
  };

  return (
    <section className="flex flex-col gap-4 p-5" style={{ border: "1px solid var(--color-braise)", background: "var(--color-basalte-2)" }}>
      <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
        COMPLÉMENT DEMANDÉ
      </p>
      {job.statusMessage ? (
        <p style={{ color: "var(--color-pierre)", lineHeight: 1.6 }}>{job.statusMessage}</p>
      ) : null}
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={4}
        placeholder="Votre réponse…"
        className="w-full resize-y bg-transparent px-3 py-3 outline-none focus-visible:border-(--color-bronze)"
        style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
      />
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p, i) => (
            <img key={i} src={p.url} alt={p.room} className="aspect-4/3 w-full object-cover" style={{ border: "1px solid var(--color-filet)" }} />
          ))}
        </div>
      ) : null}
      {erreur ? (
        <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
          {erreur}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <label className="voix-mono cursor-pointer px-4 py-2.5" style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}>
          + Joindre des photos
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(e) => {
              ajouter(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          disabled={enCours || (!texte.trim() && photos.length === 0)}
          onClick={async () => {
            setEnCours(true);
            try {
              await backend.repondreComplement(job.id, texte.trim(), photos);
              onRepondu();
            } catch {
              setErreur("Envoi impossible.");
              setEnCours(false);
            }
          }}
          className="voix-mono px-6 py-2.5 disabled:opacity-50"
          style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
        >
          {enCours ? "Envoi…" : "Envoyer la réponse"}
        </button>
      </div>
    </section>
  );
}

/* La livraison : lecteurs 16:9 et 9:16 + téléchargement + staging avant/après. */
function Livraison({ job }: { job: Job }) {
  const films = job.deliverables.filter((d) => d.kind === "film_16x9" || d.kind === "film_9x16");
  const stagings = job.deliverables.filter((d) => d.kind === "staging_avant_apres");

  return (
    <section className="flex flex-col gap-8">
      {films.map((d, i) => (
        <figure key={i} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
              {LIBELLE_LIVRABLE[d.kind]}
            </p>
            <a
              href={d.url}
              download={`${job.property.title} ${d.kind === "film_16x9" ? "16x9" : "9x16"}.mp4`}
              className="voix-mono underline underline-offset-4"
              style={{ color: "var(--color-pierre)" }}
            >
              Télécharger
            </a>
          </div>
          <video
            src={d.url}
            controls
            playsInline
            preload="metadata"
            className={d.kind === "film_9x16" ? "mx-auto w-full max-w-xs" : "w-full"}
            style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
          />
        </figure>
      ))}

      {stagings.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
            STAGING AVANT/APRÈS
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stagings.map((d, i) => (
              <figure key={i} className="flex flex-col gap-1.5">
                <a href={d.url} download>
                  <img src={d.url} alt={`Staging ${d.room ?? ""}`} className="aspect-4/3 w-full object-cover" style={{ border: "1px solid var(--color-filet)" }} />
                </a>
                {d.room ? (
                  <figcaption className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
                    {d.room}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
          <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
            VISUELS VIRTUELLEMENT AMÉNAGÉS, NON CONTRACTUELS.
          </p>
        </div>
      ) : null}
    </section>
  );
}

/* Suivi des demandes : la liste, puis le détail (statut, complément,
   livraison, photos déposées). */
export default function MesDemandes({ jobs, onMaj }: { jobs: Job[]; onMaj: () => void }) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const job = jobs.find((j) => j.id === ouvert) ?? null;

  if (jobs.length === 0) {
    return (
      <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
        AUCUNE DEMANDE POUR L&apos;INSTANT. DÉPOSEZ LA PREMIÈRE DEPUIS L&apos;ONGLET « NOUVELLE DEMANDE ».
      </p>
    );
  }

  if (job) {
    return (
      <div className="flex flex-col gap-8">
        <button
          type="button"
          onClick={() => setOuvert(null)}
          className="voix-mono self-start underline underline-offset-4"
          style={{ color: "var(--color-gris-pierre)" }}
        >
          ← Toutes les demandes
        </button>

        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="voix-display" style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}>
            {job.property.title}
          </h2>
          <span className="voix-mono" style={{ color: couleurStatus(job.status) }}>
            {LIBELLE_STATUS[job.status]}
          </span>
        </div>
        <p className="voix-mono -mt-6" style={{ color: "var(--color-gris-pierre)" }}>
          {job.property.city} · DÉPOSÉE LE {dateCourte(job.createdAt)}
        </p>

        {job.status === "attention_requise" ? <ReponseComplement job={job} onRepondu={onMaj} /> : null}

        {job.status === "livre" && job.deliverables.length > 0 ? (
          <Livraison job={job} />
        ) : job.status !== "attention_requise" ? (
          <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
            {job.status === "livre"
              ? "LIVRAISON EN COURS DE DÉPÔT."
              : "VOUS SEREZ AVERTI PAR EMAIL DÈS LA LIVRAISON."}
          </p>
        ) : null}

        <section className="flex flex-col gap-3">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            {job.photos.length} PHOTOS DÉPOSÉES
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {job.photos.map((p, i) => (
              <figure key={i} className="flex flex-col gap-1">
                <img src={p.url} alt={p.room} className="aspect-4/3 w-full object-cover" style={{ border: "1px solid var(--color-filet)" }} />
                <figcaption className="voix-mono" style={{ color: "var(--color-gris-pierre)", fontSize: "0.5625rem" }}>
                  {p.room}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {job.agencement ? (
          <section className="flex flex-col gap-2">
            <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
              AGENCEMENT DÉCRIT
            </p>
            <p className="max-w-xl whitespace-pre-wrap" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
              {job.agencement}
            </p>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {jobs.map((j) => (
        <li key={j.id} style={{ borderTop: "1px solid var(--color-filet)" }}>
          <button
            type="button"
            onClick={() => setOuvert(j.id)}
            className="group flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 text-left"
          >
            <span
              className="voix-display transition-colors duration-200 group-hover:text-(--color-braise-vive)"
              style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}
            >
              {j.property.title}
            </span>
            <span className="voix-mono" style={{ color: couleurStatus(j.status) }}>
              {j.property.city} · {dateCourte(j.createdAt)} · {LIBELLE_STATUS[j.status]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
