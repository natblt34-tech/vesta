"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";
import { useAuth } from "@/lib/client/auth";
import { backend } from "@/lib/client/backend";
import { importerVideoSession } from "@/lib/client/media";
import Champ from "./Champ";
import {
  couleurStatus,
  LIBELLE_LIVRABLE,
  LIBELLE_STATUS,
  type CompteClient,
  type DeliverableKind,
  type Job,
  type StatusJob,
} from "@/lib/client/types";

const STATUTS: StatusJob[] = ["recu", "analyse", "en_production", "controle_qualite", "livre", "attention_requise"];

/* Pilotage d'une demande : statut, livrables, email. En prod, le pipeline
   fait la même chose par l'API REST (voir PIPELINE.md) ; cette vue reste
   la commande manuelle. */
function DetailJob({ job, onMaj }: { job: Job; onMaj: () => void }) {
  const [status, setStatus] = useState<StatusJob>(job.status);
  const [message, setMessage] = useState(job.statusMessage ?? "");
  const [kind, setKind] = useState<DeliverableKind>("film_16x9");
  const [room, setRoom] = useState("");
  const [info, setInfo] = useState("");

  const appliquer = async () => {
    await backend.changerStatus(job.id, status, message);
    setInfo(
      status === "livre"
        ? "STATUT APPLIQUÉ. EMAIL « VOTRE FILM EST PRÊT » ENVOYÉ."
        : status === "attention_requise"
          ? "STATUT APPLIQUÉ. LE CLIENT EST NOTIFIÉ PAR EMAIL."
          : "STATUT APPLIQUÉ.",
    );
    onMaj();
  };

  const deposer = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { url } = importerVideoSession(files[0]);
    await backend.deposerLivrable(job.id, {
      kind,
      url,
      ...(kind === "staging_avant_apres" && room.trim() ? { room: room.trim() } : {}),
    });
    setInfo("LIVRABLE DÉPOSÉ. PASSEZ LA DEMANDE À « LIVRÉE » POUR NOTIFIER LE CLIENT.");
    onMaj();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="voix-display" style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}>
          {job.property.title}
        </h2>
        <p className="voix-mono mt-2" style={{ color: "var(--color-gris-pierre)" }}>
          {job.client.agence || job.client.email} · {job.property.city} · {job.photos.length} PHOTOS ·{" "}
          <span style={{ color: couleurStatus(job.status) }}>{LIBELLE_STATUS[job.status]}</span>
        </p>
      </div>

      {/* Le dossier client */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {job.photos.map((p, i) => (
          <figure key={i} className="flex flex-col gap-1">
            <img src={p.url} alt={p.room} className="aspect-4/3 w-full object-cover" style={{ border: "1px solid var(--color-filet)" }} />
            <figcaption className="voix-mono" style={{ color: "var(--color-bronze)", fontSize: "0.5625rem" }}>
              {p.room}
            </figcaption>
          </figure>
        ))}
      </div>

      {job.agencement ? (
        <div className="flex flex-col gap-2">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            AGENCEMENT
          </p>
          <p className="max-w-xl whitespace-pre-wrap" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
            {job.agencement}
          </p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-1.5">
        {[
          ["FORMATS", job.options.formats.join(" + ") || "AUCUN"],
          [
            "STAGING",
            job.options.staging.length
              ? job.options.staging.map((s) => `${s.room} (${s.style})`).join(", ")
              : "NON",
          ],
          ["EXCLUSIONS", job.options.exclude.join(", ") || "AUCUNE"],
          ["PLAN", job.floorplanUrl ? "JOINT" : "AUCUN"],
        ].map(([k, v]) => (
          <li key={k} className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--color-bronze)" }}>{k} · </span>
            {v}
          </li>
        ))}
      </ul>
      {job.floorplanUrl ? (
        <a
          href={job.floorplanUrl}
          target="_blank"
          rel="noreferrer"
          className="voix-mono -mt-4 self-start underline underline-offset-4"
          style={{ color: "var(--color-pierre)" }}
        >
          Ouvrir le plan
        </a>
      ) : null}

      {job.reponses.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            RÉPONSES DU CLIENT
          </p>
          {job.reponses.map((r, i) => (
            <div key={i} className="flex flex-col gap-2 px-4 py-3" style={{ borderLeft: "2px solid var(--color-filet)" }}>
              {r.texte ? <p style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>{r.texte}</p> : null}
              {r.photos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {r.photos.map((p, k) => (
                    <img key={k} src={p.url} alt={p.room} className="aspect-4/3 w-full object-cover" style={{ border: "1px solid var(--color-filet)" }} />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Statut */}
      <section className="flex flex-col gap-3 p-5" style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}>
        <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
          STATUT
        </p>
        <div className="flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusJob)}
            className="bg-transparent px-3 py-2.5 outline-none"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          >
            {STATUTS.map((s) => (
              <option key={s} value={s} style={{ background: "var(--color-basalte)" }}>
                {LIBELLE_STATUS[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={appliquer}
            className="voix-mono px-5 py-2.5"
            style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
          >
            Appliquer
          </button>
        </div>
        {status === "attention_requise" ? (
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="La précision attendue du client…"
            className="w-full resize-y bg-transparent px-3 py-3 outline-none"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          />
        ) : null}
      </section>

      {/* Livrables */}
      <section className="flex flex-col gap-3 p-5" style={{ border: "1px solid var(--color-braise)", background: "var(--color-basalte-2)" }}>
        <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
          LIVRABLES · {job.deliverables.length}
        </p>
        {job.deliverables.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {job.deliverables.map((d, i) => (
              <li key={i} className="voix-mono" style={{ color: "var(--color-pierre)" }}>
                {LIBELLE_LIVRABLE[d.kind]}
                {d.room ? ` · ${d.room}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DeliverableKind)}
            className="bg-transparent px-3 py-2.5 outline-none"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          >
            {(Object.keys(LIBELLE_LIVRABLE) as DeliverableKind[]).map((k) => (
              <option key={k} value={k} style={{ background: "var(--color-basalte)" }}>
                {LIBELLE_LIVRABLE[k]}
              </option>
            ))}
          </select>
          {kind === "staging_avant_apres" ? (
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="pièce (ex : chambre1)"
              className="voix-mono bg-transparent px-3 py-2.5 outline-none"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            />
          ) : null}
          <label className="voix-mono cursor-pointer px-4 py-2.5" style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}>
            Choisir le fichier
            <input
              type="file"
              accept={kind === "staging_avant_apres" ? "image/*" : "video/*"}
              className="hidden"
              onChange={(e) => {
                deposer(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {job.status === "livre" ? (
          <button
            type="button"
            onClick={async () => {
              await backend.renvoyerEmailLivraison(job.id);
              setInfo("EMAIL DE LIVRAISON RENVOYÉ.");
            }}
            className="voix-mono self-start underline underline-offset-4"
            style={{ color: "var(--color-pierre)" }}
          >
            Renvoyer l&apos;email de livraison
          </button>
        ) : null}
      </section>

      {info ? (
        <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
          {info}
        </p>
      ) : null}
    </div>
  );
}

/* Comptes clients : création par Vesta (pas d'inscription libre) avec
   formule (nom + quota films/mois, jamais de montant) -> lien d'invitation. */
function Comptes() {
  const [comptes, setComptes] = useState<CompteClient[]>([]);
  const [lien, setLien] = useState("");
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    setComptes(await backend.comptesClients());
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <form
        className="flex flex-col gap-5 p-5"
        style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
        onSubmit={async (e) => {
          e.preventDefault();
          setErreur("");
          setLien("");
          const data = new FormData(e.currentTarget);
          try {
            const { lienInvitation } = await backend.creerCompteClient(
              String(data.get("email")),
              String(data.get("agence")),
              { nom: String(data.get("formule")), quotaFilmsMois: Number(data.get("quota")) },
            );
            setLien(lienInvitation);
            (e.target as HTMLFormElement).reset();
            charger();
          } catch (err) {
            setErreur(err instanceof Error ? err.message : "Création impossible.");
          }
        }}
      >
        <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
          NOUVEAU COMPTE CLIENT
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ label="EMAIL" name="email" type="email" required />
          <Champ label="AGENCE" name="agence" required />
          <Champ label="FORMULE" name="formule" placeholder="Ex : Essentiel" required />
          <Champ label="FILMS / MOIS" name="quota" type="number" min={1} defaultValue={4} required />
        </div>
        {erreur ? (
          <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
            {erreur}
          </p>
        ) : null}
        <button
          type="submit"
          className="voix-mono self-start px-6 py-3"
          style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
        >
          Créer et générer le lien d&apos;invitation
        </button>
        {lien ? (
          <p className="voix-mono break-all" style={{ color: "var(--color-bronze)", lineHeight: 1.6 }}>
            LIEN À ENVOYER AU CLIENT · {lien}
          </p>
        ) : null}
      </form>

      <ul className="flex flex-col">
        {comptes.map((c) => (
          <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4" style={{ borderTop: "1px solid var(--color-filet)" }}>
            <span style={{ color: "var(--color-pierre)" }}>{c.agence || c.email}</span>
            <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              {c.email} · {c.formule.nom.toUpperCase()} · {c.filmsCeMois}/{c.formule.quotaFilmsMois} FILMS CE MOIS-CI
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type OngletStudio = "demandes" | "comptes";

/* Interface studio (côté Vesta) : toutes les demandes tous clients,
   statuts, dépôt des livrables, emails, comptes clients. */
export default function Studio() {
  const router = useRouter();
  const { user, pret, deconnexion } = useAuth();
  const [onglet, setOnglet] = useState<OngletStudio>("demandes");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ouvert, setOuvert] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setJobs(await backend.tousLesJobs());
  }, []);

  useEffect(() => {
    if (!pret) return;
    if (!user || user.role !== "vesta") {
      router.replace("/connexion");
      return;
    }
    charger();
  }, [pret, user, router, charger]);

  if (!pret || !user || user.role !== "vesta") return null;

  const job = jobs.find((j) => j.id === ouvert) ?? null;

  return (
    <main className="marge min-h-svh py-14 sm:py-20" style={{ background: "var(--color-basalte)" }}>
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 sm:mb-14">
        <TransitionLink
          href="/"
          className="inline-flex items-baseline"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontStretch: "125%",
            fontSize: "1.25rem",
            color: "var(--color-pierre)",
            lineHeight: 1,
          }}
        >
          vesta
          <Etoile />
          <span className="voix-mono ml-3" style={{ color: "var(--color-bronze)" }}>
            STUDIO
          </span>
        </TransitionLink>
        <button
          type="button"
          onClick={() => {
            deconnexion();
            router.replace("/");
          }}
          className="voix-mono underline underline-offset-4"
          style={{ color: "var(--color-pierre)" }}
        >
          Déconnexion
        </button>
      </header>

      <nav className="mb-10 flex gap-2" role="tablist">
        {([
          ["demandes", "Demandes"],
          ["comptes", "Comptes clients"],
        ] as [OngletStudio, string][]).map(([cle, libelle]) => {
          const actif = onglet === cle;
          return (
            <button
              key={cle}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => {
                setOnglet(cle);
                setOuvert(null);
              }}
              className="voix-mono px-5 py-3 transition-colors duration-200"
              style={{
                border: `1px solid ${actif ? "var(--color-braise)" : "var(--color-filet)"}`,
                color: actif ? "var(--color-pierre)" : "var(--color-gris-pierre)",
                background: actif ? "var(--color-basalte-2)" : "transparent",
              }}
            >
              {libelle}
            </button>
          );
        })}
      </nav>

      {onglet === "comptes" ? (
        <Comptes />
      ) : job ? (
        <div className="flex max-w-3xl flex-col gap-8">
          <button
            type="button"
            onClick={() => setOuvert(null)}
            className="voix-mono self-start underline underline-offset-4"
            style={{ color: "var(--color-gris-pierre)" }}
          >
            ← Toutes les demandes
          </button>
          <DetailJob job={job} onMaj={charger} />
        </div>
      ) : (
        <ul className="flex max-w-3xl flex-col">
          {jobs.length === 0 ? (
            <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              AUCUNE DEMANDE POUR L&apos;INSTANT.
            </p>
          ) : (
            jobs.map((j) => (
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
                    {j.client.agence || j.client.email} · {LIBELLE_STATUS[j.status]}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </main>
  );
}
