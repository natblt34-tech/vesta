"use client";

import { useMemo, useState } from "react";
import { backend } from "@/lib/client/backend";
import { importerPhoto } from "@/lib/client/media";
import { BoutonBraise, Chronologie, EnTetePage, EtatVide, Pastille } from "./Interface";
import {
  LIBELLE_LIVRABLE,
  type Job,
  type JobPhoto,
  type StatusJob,
} from "@/lib/client/types";

function dateCourte(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

const EN_COURS: StatusJob[] = ["recu", "analyse", "en_production", "controle_qualite"];

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
    <section
      className="flex flex-col gap-4 p-5 sm:p-6"
      style={{ border: "1px solid var(--color-braise)", background: "var(--color-basalte-2)" }}
    >
      <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
        LE STUDIO A BESOIN D&apos;UNE PRÉCISION
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
      <div className="flex flex-wrap items-center gap-3">
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
        <BoutonBraise
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
        >
          {enCours ? "Envoi…" : "Envoyer la réponse"}
        </BoutonBraise>
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

/* Détail d'une demande : contenu principal + panneau latéral (chronologie,
   métadonnées) — la lecture d'un dossier, pas une simple fiche. */
function Detail({ job, onRetour, onMaj }: { job: Job; onRetour: () => void; onMaj: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <button
        type="button"
        onClick={onRetour}
        className="voix-mono self-start underline underline-offset-4"
        style={{ color: "var(--color-gris-pierre)" }}
      >
        ← Toutes les demandes
      </button>

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="voix-display" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--color-pierre)", lineHeight: 0.95 }}>
            {job.property.title}
          </h1>
          <p className="voix-mono mt-2" style={{ color: "var(--color-gris-pierre)" }}>
            {job.property.city} · DÉPOSÉE LE {dateCourte(job.createdAt)}
            {job.client.prenom ? ` · PAR ${job.client.prenom.toUpperCase()}` : ""}
          </p>
        </div>
        <Pastille status={job.status} />
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Colonne principale */}
        <div className="flex min-w-0 flex-col gap-10">
          {job.status === "attention_requise" ? <ReponseComplement job={job} onRepondu={onMaj} /> : null}

          {job.status === "livre" && job.deliverables.length > 0 ? (
            <Livraison job={job} />
          ) : job.status !== "attention_requise" ? (
            <p className="voix-mono px-4 py-3" style={{ borderLeft: "2px solid var(--color-filet)", color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
              {job.status === "livre" ? "LIVRAISON EN COURS DE DÉPÔT." : "VOUS SEREZ AVERTI PAR EMAIL DÈS LA LIVRAISON."}
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

        {/* Panneau latéral */}
        <aside
          className="flex flex-col gap-6 p-5 lg:sticky lg:top-12"
          style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
        >
          <div>
            <p className="voix-mono mb-4" style={{ color: "var(--color-bronze)" }}>
              PRODUCTION
            </p>
            <Chronologie status={job.status} />
          </div>
          <div className="flex flex-col gap-1.5 pt-5" style={{ borderTop: "1px solid var(--color-filet)" }}>
            {[
              ["FORMATS", job.options.formats.join(" + ") || "AUCUN"],
              ["STAGING", job.options.staging.length ? job.options.staging.map((s) => s.room).join(", ") : "NON"],
              ["EXCLUSIONS", job.options.exclude.join(", ") || "AUCUNE"],
              ["PLAN", job.floorplanUrl ? "JOINT" : "AUCUN"],
            ].map(([k, v]) => (
              <p key={k} className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.7 }}>
                <span style={{ color: "var(--color-bronze)" }}>{k} · </span>
                {v}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

type Filtre = "toutes" | "en-cours" | "livrees" | "a-completer";

const FILTRES: { id: Filtre; libelle: string }[] = [
  { id: "toutes", libelle: "TOUTES" },
  { id: "en-cours", libelle: "EN COURS" },
  { id: "livrees", libelle: "LIVRÉES" },
  { id: "a-completer", libelle: "À COMPLÉTER" },
];

/* Liste des demandes : recherche + filtres de statut, lignes tabulaires. */
export default function MesDemandes({
  jobs,
  ouvert,
  onOuvrir,
  onMaj,
  onNouvelle,
}: {
  jobs: Job[];
  ouvert: string | null;
  onOuvrir: (id: string | null) => void;
  onMaj: () => void;
  onNouvelle: () => void;
}) {
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("toutes");

  const job = jobs.find((j) => j.id === ouvert) ?? null;

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return jobs.filter((j) => {
      if (q && !`${j.property.title} ${j.property.city}`.toLowerCase().includes(q)) return false;
      if (filtre === "en-cours") return EN_COURS.includes(j.status);
      if (filtre === "livrees") return j.status === "livre";
      if (filtre === "a-completer") return j.status === "attention_requise";
      return true;
    });
  }, [jobs, recherche, filtre]);

  if (job) return <Detail job={job} onRetour={() => onOuvrir(null)} onMaj={onMaj} />;

  return (
    <div className="flex flex-col gap-7">
      <EnTetePage titre="Demandes" sous={`${jobs.length} AU TOTAL`} />

      {jobs.length === 0 ? (
        <EtatVide
          titre="AUCUNE DEMANDE POUR L'INSTANT."
          action={<BoutonBraise onClick={onNouvelle}>Déposer une demande</BoutonBraise>}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="RECHERCHER UN BIEN, UNE VILLE…"
              aria-label="Rechercher une demande"
              className="voix-mono w-full bg-transparent px-3 py-2.5 outline-none focus-visible:border-(--color-bronze) sm:max-w-xs"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            />
            <div className="flex flex-wrap gap-1.5">
              {FILTRES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltre(f.id)}
                  aria-pressed={filtre === f.id}
                  className="voix-mono px-3 py-2 transition-colors duration-200"
                  style={{
                    border: `1px solid ${filtre === f.id ? "var(--color-braise)" : "var(--color-filet)"}`,
                    color: filtre === f.id ? "var(--color-pierre)" : "var(--color-gris-pierre)",
                  }}
                >
                  {f.libelle}
                </button>
              ))}
            </div>
          </div>

          {visibles.length === 0 ? (
            <EtatVide titre="RIEN NE CORRESPOND À CETTE RECHERCHE." />
          ) : (
            <ul className="flex flex-col" style={{ borderTop: "1px solid var(--color-filet)" }}>
              {visibles.map((j) => (
                <li key={j.id} style={{ borderBottom: "1px solid var(--color-filet)" }}>
                  <button
                    type="button"
                    onClick={() => onOuvrir(j.id)}
                    className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-4 text-left sm:grid-cols-[minmax(0,1fr)_7rem_11rem_auto]"
                  >
                    <span className="min-w-0">
                      <span
                        className="block truncate transition-colors duration-200 group-hover:text-(--color-braise-vive)"
                        style={{ color: "var(--color-pierre)", fontSize: "1.02rem" }}
                      >
                        {j.property.title}
                      </span>
                      <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
                        {j.property.city}
                        {j.client.prenom ? ` · PAR ${j.client.prenom.toUpperCase()}` : ""}
                      </span>
                    </span>
                    <span className="voix-mono hidden sm:block" style={{ color: "var(--color-gris-pierre)" }}>
                      {dateCourte(j.createdAt)}
                    </span>
                    <span className="justify-self-start">
                      <Pastille status={j.status} />
                    </span>
                    <span aria-hidden="true" className="voix-mono transition-colors duration-200 group-hover:text-(--color-braise-vive)" style={{ color: "var(--color-filet)" }}>
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
