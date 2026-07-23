"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/client/auth";
import { backend } from "@/lib/client/backend";
import { importerVideoSession } from "@/lib/client/media";
import Champ from "./Champ";
import CoquilleEspace, { Ico } from "./CoquilleEspace";
import { BoutonBraise, Chronologie, EnTetePage, EtatVide, Pastille, TuileStat } from "./Interface";
import {
  LIBELLE_LIVRABLE,
  LIBELLE_STATUS,
  type CompteAgence,
  type DeliverableKind,
  type Job,
  type StatusJob,
} from "@/lib/client/types";

const STATUTS: StatusJob[] = ["recu", "analyse", "en_production", "controle_qualite", "livre", "attention_requise"];

function dateCourte(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/* Pilotage d'une demande : dossier client à gauche, commandes à droite.
   En prod, le pipeline fait la même chose par l'API REST (PIPELINE.md) ;
   cette vue reste la commande manuelle. */
function DetailJob({ job, onRetour, onMaj }: { job: Job; onRetour: () => void; onMaj: () => void }) {
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
            {job.client.agence || job.client.email} · {job.property.city} · DÉPOSÉE LE {dateCourte(job.createdAt)}
          </p>
        </div>
        <Pastille status={job.status} />
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ——— Le dossier client ——— */}
        <div className="flex min-w-0 flex-col gap-9">
          <section className="flex flex-col gap-3">
            <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
              {job.photos.length} PHOTOS · PIÈCES NOMMÉES
            </p>
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
          </section>

          {job.agencement ? (
            <section className="flex flex-col gap-2">
              <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
                AGENCEMENT
              </p>
              <p className="max-w-xl whitespace-pre-wrap" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
                {job.agencement}
              </p>
            </section>
          ) : null}

          <section className="flex flex-col gap-1.5">
            {[
              ["FORMATS", job.options.formats.join(" + ") || "AUCUN"],
              ["STAGING", job.options.staging.length ? job.options.staging.map((s) => `${s.room} (${s.style})`).join(", ") : "NON"],
              ["EXCLUSIONS", job.options.exclude.join(", ") || "AUCUNE"],
            ].map(([k, v]) => (
              <p key={k} className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.7 }}>
                <span style={{ color: "var(--color-bronze)" }}>{k} · </span>
                {v}
              </p>
            ))}
            {job.floorplanUrl ? (
              <a
                href={job.floorplanUrl}
                target="_blank"
                rel="noreferrer"
                className="voix-mono mt-2 self-start underline underline-offset-4"
                style={{ color: "var(--color-pierre)" }}
              >
                Ouvrir le plan joint
              </a>
            ) : null}
          </section>

          {job.reponses.length > 0 ? (
            <section className="flex flex-col gap-3">
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
            </section>
          ) : null}
        </div>

        {/* ——— Le pilotage ——— */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-12">
          <div className="p-5" style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}>
            <p className="voix-mono mb-4" style={{ color: "var(--color-bronze)" }}>
              PRODUCTION
            </p>
            <Chronologie status={job.status} />
          </div>

          <div className="flex flex-col gap-3 p-5" style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}>
            <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
              STATUT
            </p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusJob)}
              className="w-full bg-transparent px-3 py-2.5 outline-none"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            >
              {STATUTS.map((s) => (
                <option key={s} value={s} style={{ background: "var(--color-basalte)" }}>
                  {LIBELLE_STATUS[s]}
                </option>
              ))}
            </select>
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
            <BoutonBraise onClick={appliquer} className="self-start !px-5 !py-2.5">
              Appliquer
            </BoutonBraise>
          </div>

          <div className="flex flex-col gap-3 p-5" style={{ border: "1px solid var(--color-braise)", background: "var(--color-basalte-2)" }}>
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
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as DeliverableKind)}
              className="w-full bg-transparent px-3 py-2.5 outline-none"
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
                className="voix-mono w-full bg-transparent px-3 py-2.5 outline-none"
                style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
              />
            ) : null}
            <label className="voix-mono cursor-pointer self-start px-4 py-2.5" style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}>
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
          </div>

          {info ? (
            <p className="voix-mono" style={{ color: "var(--color-bronze)", lineHeight: 1.6 }}>
              {info}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

/* Agences clientes : Vesta invite un fondateur (email + formule, jamais
   de montant) ; celui-ci nomme son agence à la création de ses accès,
   ce qui crée le workspace, puis invite ses collègues lui-même. */
function Comptes() {
  const [comptes, setComptes] = useState<CompteAgence[]>([]);
  const [lien, setLien] = useState("");
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    setComptes(await backend.agences());
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <div className="flex flex-col gap-8">
      <EnTetePage titre="Agences clientes" sous={`${comptes.length} AGENCE${comptes.length > 1 ? "S" : ""}`} />

      <form
        className="flex flex-col gap-5 p-5 sm:p-6"
        style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
        onSubmit={async (e) => {
          e.preventDefault();
          setErreur("");
          setLien("");
          const data = new FormData(e.currentTarget);
          try {
            const { lienInvitation } = await backend.creerInvitationClient(String(data.get("email")), {
              nom: String(data.get("formule")),
              quotaFilmsMois: Number(data.get("quota")),
            });
            setLien(lienInvitation);
            (e.target as HTMLFormElement).reset();
          } catch (err) {
            setErreur(err instanceof Error ? err.message : "Création impossible.");
          }
        }}
      >
        <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
          INVITER UNE NOUVELLE AGENCE
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          <Champ label="EMAIL DU FONDATEUR" name="email" type="email" required />
          <Champ label="FORMULE" name="formule" placeholder="Ex : Essentiel" required />
          <Champ label="FILMS / MOIS" name="quota" type="number" min={1} defaultValue={4} required />
        </div>
        <p className="voix-mono -mt-2" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
          LE CLIENT NOMMERA SON AGENCE À LA CRÉATION DE SES ACCÈS, PUIS INVITERA SES COLLÈGUES LUI-MÊME.
        </p>
        {erreur ? (
          <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
            {erreur}
          </p>
        ) : null}
        <BoutonBraise type="submit" className="self-start">
          Générer le lien d&apos;invitation
        </BoutonBraise>
        {lien ? (
          <p className="voix-mono break-all" style={{ color: "var(--color-bronze)", lineHeight: 1.6 }}>
            LIEN À ENVOYER AU CLIENT · {lien}
          </p>
        ) : null}
      </form>

      <ul className="flex flex-col" style={{ borderTop: "1px solid var(--color-filet)" }}>
        {comptes.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
            style={{ borderBottom: "1px solid var(--color-filet)" }}
          >
            <span style={{ color: "var(--color-pierre)" }}>{c.nom}</span>
            <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              {c.membres.length} MEMBRE{c.membres.length > 1 ? "S" : ""} · {c.formule.nom.toUpperCase()} ·{" "}
              {c.filmsCeMois}/{c.formule.quotaFilmsMois} FILMS CE MOIS-CI
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Vue = "demandes" | "comptes";

/* Interface studio (côté Vesta) : toutes les demandes tous clients,
   pilotage de production, comptes. */
export default function Studio() {
  const router = useRouter();
  const { user, pret, deconnexion } = useAuth();
  const [vue, setVue] = useState<Vue>("demandes");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");

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

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      `${j.property.title} ${j.property.city} ${j.client.agence} ${j.client.email}`.toLowerCase().includes(q),
    );
  }, [jobs, recherche]);

  if (!pret || !user || user.role !== "vesta") return null;

  const job = jobs.find((j) => j.id === ouvert) ?? null;
  const aTraiter = jobs.filter((j) => j.status === "recu" || j.status === "analyse").length;
  const enProduction = jobs.filter((j) => j.status === "en_production" || j.status === "controle_qualite").length;

  return (
    <CoquilleEspace
      marque="STUDIO"
      nav={[
        { id: "demandes", libelle: "Demandes", icone: Ico.demandes, alerte: aTraiter > 0 },
        { id: "comptes", libelle: "Comptes clients", icone: Ico.comptes },
      ]}
      actif={vue}
      onChange={(id) => {
        setVue(id as Vue);
        setOuvert(null);
      }}
      agence="Studio Vesta"
      email={user.email}
      onDeconnexion={() => {
        deconnexion();
        router.replace("/");
      }}
    >
      {vue === "comptes" ? (
        <Comptes />
      ) : job ? (
        <DetailJob job={job} onRetour={() => setOuvert(null)} onMaj={charger} />
      ) : (
        <div className="flex flex-col gap-7">
          <EnTetePage titre="Demandes" sous={`${jobs.length} AU TOTAL`} />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <TuileStat label="À TRAITER" valeur={aTraiter} accent={aTraiter > 0} />
            <TuileStat label="EN PRODUCTION" valeur={enProduction} />
            <TuileStat label="LIVRÉES" valeur={jobs.filter((j) => j.status === "livre").length} />
          </div>

          {jobs.length === 0 ? (
            <EtatVide titre="AUCUNE DEMANDE POUR L'INSTANT." />
          ) : (
            <>
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="RECHERCHER UN BIEN, UNE AGENCE…"
                aria-label="Rechercher une demande"
                className="voix-mono w-full max-w-xs bg-transparent px-3 py-2.5 outline-none focus-visible:border-(--color-bronze)"
                style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
              />
              <ul className="flex flex-col" style={{ borderTop: "1px solid var(--color-filet)" }}>
                {visibles.map((j) => (
                  <li key={j.id} style={{ borderBottom: "1px solid var(--color-filet)" }}>
                    <button
                      type="button"
                      onClick={() => setOuvert(j.id)}
                      className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-4 text-left sm:grid-cols-[minmax(0,1fr)_7rem_12rem_auto]"
                    >
                      <span className="min-w-0">
                        <span
                          className="block truncate transition-colors duration-200 group-hover:text-(--color-braise-vive)"
                          style={{ color: "var(--color-pierre)", fontSize: "1.02rem" }}
                        >
                          {j.property.title}
                        </span>
                        <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
                          {j.client.agence || j.client.email} · {j.property.city}
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
            </>
          )}
        </div>
      )}
    </CoquilleEspace>
  );
}
