"use client";

import { useMemo, useState } from "react";
import { backend } from "@/lib/client/backend";
import { importerFichier, importerPhoto } from "@/lib/client/media";
import { assainirPiece, PIECES_SUGGEREES, piecesDistinctes, suffixerPiece } from "@/lib/client/pieces";
import { STYLES_STAGING, type Format, type Formule, type StyleStaging } from "@/lib/client/types";
import { BoutonBraise, EnTetePage, EtatVide } from "./Interface";

const MAX_PHOTOS = 20;

const ETAPES = ["LE BIEN", "LES PHOTOS", "L'AGENCEMENT", "LES OPTIONS", "ENVOI"];

type PhotoForm = { id: string; url: string; room: string };

/* Petit toggle à la charte : bordure filet, braise quand actif. */
function Toggle({
  actif,
  onClick,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className="voix-mono px-4 py-2.5 transition-colors duration-200"
      style={{
        border: `1px solid ${actif ? "var(--color-braise)" : "var(--color-filet)"}`,
        color: actif ? "var(--color-pierre)" : "var(--color-gris-pierre)",
        background: actif ? "var(--color-basalte-2)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}

/* La demande en assistant par étapes : une décision à la fois, pensé
   téléphone d'abord. Les noms de pièces des photos sont la clé d'entrée
   du pipeline — suggestions cliquables, suffixe numérique automatique.
   Les restrictions de la formule s'appliquent d'elles-mêmes : quota
   atteint = dépôt bloqué, staging masqué si non inclus. */
export default function NouvelleDemande({
  onEnvoye,
  formule,
  restants,
  stagingUtilises,
}: {
  onEnvoye: () => void;
  formule?: Formule;
  restants?: number | null;
  stagingUtilises?: number;
}) {
  const [etape, setEtape] = useState(0);
  const [titre, setTitre] = useState("");
  const [ville, setVille] = useState("");
  const [photos, setPhotos] = useState<PhotoForm[]>([]);
  const [actif, setActif] = useState<string | null>(null);
  const [agencement, setAgencement] = useState("");
  const [plan, setPlan] = useState<{ url: string; nomFichier: string } | null>(null);
  const [formats, setFormats] = useState<Format[]>(["16:9", "9:16"]);
  const [stagingRooms, setStagingRooms] = useState<string[]>([]);
  const [stagingStyle, setStagingStyle] = useState<StyleStaging>(STYLES_STAGING[0]);
  const [excludeRooms, setExcludeRooms] = useState<string[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const pieces = useMemo(() => piecesDistinctes(photos.map((p) => p.room)), [photos]);

  const ajouterPhotos = async (files: FileList | null) => {
    if (!files) return;
    setErreur("");
    const valides = Array.from(files).filter((f) => ["image/jpeg", "image/png"].includes(f.type));
    if (valides.length < files.length) setErreur("Formats acceptés : JPG et PNG.");
    const place = MAX_PHOTOS - photos.length;
    if (valides.length > place) setErreur(`${MAX_PHOTOS} photos maximum par demande.`);
    try {
      const nouvelles = await Promise.all(valides.slice(0, Math.max(0, place)).map(importerPhoto));
      setPhotos((p) => [
        ...p,
        ...nouvelles.map((n) => ({ id: Math.random().toString(36).slice(2, 10), url: n.url, room: "" })),
      ]);
    } catch {
      setErreur("Une image n'a pas pu être importée.");
    }
  };

  const retirerPhoto = (pid: string) => setPhotos((p) => p.filter((x) => x.id !== pid));

  const nommer = (pid: string, room: string) =>
    setPhotos((p) => p.map((x) => (x.id === pid ? { ...x, room } : x)));

  /* Suggestion cliquée : premier nom libre pour cette base (sejour1, sejour2…). */
  const suggerer = (pid: string, base: string) => {
    const autres = photos.filter((x) => x.id !== pid).map((x) => x.room);
    nommer(pid, suffixerPiece(base, autres));
  };

  const assainir = (pid: string) => {
    const photo = photos.find((x) => x.id === pid);
    if (!photo) return;
    const autres = photos.filter((x) => x.id !== pid).map((x) => x.room);
    nommer(pid, assainirPiece(photo.room, autres));
    setActif(null);
  };

  const basculer = (liste: string[], setListe: (v: string[]) => void, room: string) =>
    setListe(liste.includes(room) ? liste.filter((r) => r !== room) : [...liste, room]);

  const basculerFormat = (f: Format) =>
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const joindrePlan = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setPlan(await importerFichier(files[0]));
    } catch {
      setErreur("Le plan n'a pas pu être importé.");
    }
  };

  /* Validation par étape : on n'avance pas sur un dossier incomplet. */
  const validerEtape = (n: number): string => {
    if (n === 0 && (!titre.trim() || !ville.trim())) return "Nom du bien et ville sont nécessaires.";
    if (n === 1) {
      if (photos.length === 0) return "Déposez au moins une photo.";
      const sansNom = photos.filter((p) => !p.room.trim()).length;
      if (sansNom > 0) return `${sansNom} photo(s) sans nom de pièce. Nommez chaque photo.`;
    }
    if (n === 3 && formats.length === 0) return "Choisissez au moins un format.";
    return "";
  };

  const continuer = () => {
    const e = validerEtape(etape);
    if (e) return setErreur(e);
    /* En quittant l'étape photos : normalisation finale des noms de
       pièces (accents, doublons) — la clé d'entrée du pipeline doit
       être propre quel que soit le chemin de saisie. */
    if (etape === 1) {
      /* Updater pur (StrictMode l'exécute deux fois en dev). */
      setPhotos((prev) => {
        const pris: string[] = [];
        return prev.map((p) => {
          const n = assainirPiece(p.room, pris) || suffixerPiece("piece", pris);
          pris.push(n);
          return { ...p, room: n };
        });
      });
    }
    setErreur("");
    setEtape((n) => Math.min(n + 1, ETAPES.length - 1));
  };

  const envoyer = async () => {
    for (let n = 0; n < 4; n += 1) {
      const e = validerEtape(n);
      if (e) {
        setEtape(n);
        return setErreur(e);
      }
    }
    setErreur("");
    setEnCours(true);
    try {
      await backend.creerJob({
        property: { title: titre.trim(), city: ville.trim() },
        photos: photos.map((p) => ({ room: p.room, url: p.url })),
        floorplanUrl: plan?.url ?? null,
        agencement: agencement.trim(),
        options: {
          formats: (["16:9", "9:16"] as Format[]).filter((f) => formats.includes(f)),
          staging: stagingRooms.filter((r) => pieces.includes(r)).map((room) => ({ room, style: stagingStyle })),
          exclude: excludeRooms.filter((r) => pieces.includes(r)),
        },
      });
      onEnvoye();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Envoi impossible.");
      setEnCours(false);
    }
  };

  /* Quota du mois épuisé : le dépôt est bloqué net. */
  if (restants !== null && restants !== undefined && restants <= 0) {
    return (
      <div className="flex max-w-2xl flex-col gap-8">
        <EnTetePage titre="Nouvelle demande" />
        <EtatVide titre="QUOTA DU MOIS ATTEINT. VOTRE FORMULE NE PERMET PLUS DE DÉPOSER DE DEMANDE CE MOIS-CI. RAPPROCHEZ-VOUS DU STUDIO POUR L'AJUSTER." />
      </div>
    );
  }

  /* Home staging selon la formule : non inclus, plafonné (photos/mois)
     ou illimité. Le plafond compte les pièces déjà commandées ce mois-ci. */
  const quotaStaging = formule ? formule.stagingPhotosMois : "illimite";
  const stagingRestants =
    typeof quotaStaging === "number" ? Math.max(0, quotaStaging - (stagingUtilises ?? 0)) : null;
  const stagingChoisis = stagingRooms.filter((r) => pieces.includes(r)).length;

  const basculerStaging = (room: string) => {
    const dejaActif = stagingRooms.includes(room);
    if (!dejaActif && stagingRestants !== null && stagingChoisis >= stagingRestants) return;
    basculer(stagingRooms, setStagingRooms, room);
  };

  /* Entrée = Continuer (Envoyer sur la dernière étape). Exceptions :
     textarea (retour à la ligne), nom de pièce (valide juste le nom). */
  const surTouche = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const cible = e.target as HTMLElement;
    if (cible.tagName === "TEXTAREA" || cible.tagName === "SELECT") return;
    e.preventDefault();
    if (cible.getAttribute("aria-label") === "Nom de la pièce") {
      (cible as HTMLInputElement).blur();
      return;
    }
    if (etape < ETAPES.length - 1) continuer();
    else if (!enCours) envoyer();
  };

  return (
    <div className="flex max-w-2xl flex-col gap-8" onKeyDown={surTouche}>
      <EnTetePage titre="Nouvelle demande" sous={`ÉTAPE ${etape + 1}/${ETAPES.length} · ${ETAPES[etape]}`} />

      {/* Progression */}
      <div className="-mt-4 flex flex-col gap-3">
        <div aria-hidden="true" className="h-0.5 w-full" style={{ background: "var(--color-filet)" }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${((etape + 1) / ETAPES.length) * 100}%`, background: "var(--color-braise)" }}
          />
        </div>
        <div className="hidden justify-between sm:flex">
          {ETAPES.map((e, i) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                /* On peut revenir en arrière librement, jamais sauter en avant. */
                if (i < etape) {
                  setErreur("");
                  setEtape(i);
                }
              }}
              className="voix-mono"
              style={{
                fontSize: "0.5625rem",
                color: i === etape ? "var(--color-braise-vive)" : i < etape ? "var(--color-gris-pierre)" : "var(--color-filet)",
                cursor: i < etape ? "pointer" : "default",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* ——— Étape 1 · Le bien ——— */}
      {etape === 0 ? (
        <section className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <label className="flex flex-col gap-2">
            <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              NOM DU BIEN
            </span>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex : T2 lumineux, dernier étage"
              autoFocus
              className="w-full bg-transparent px-3 py-3 outline-none focus-visible:border-(--color-bronze)"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              VILLE
            </span>
            <input
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex : Avignon"
              className="w-full bg-transparent px-3 py-3 outline-none focus-visible:border-(--color-bronze)"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            />
          </label>
        </section>
      ) : null}

      {/* ——— Étape 2 · Les photos ——— */}
      {etape === 1 ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
              {photos.length}/{MAX_PHOTOS} · 8 À 12 RECOMMANDÉES
            </p>
            <label
              className="voix-mono cursor-pointer px-4 py-2.5"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            >
              + Ajouter des photos
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={(e) => {
                  ajouterPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
            CHAQUE PHOTO DOIT PORTER LE NOM DE SA PIÈCE
          </p>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p) => (
                <div key={p.id} className="flex flex-col">
                  <div className="relative aspect-4/3 overflow-hidden" style={{ border: "1px solid var(--color-filet)" }}>
                    <img src={p.url} alt={p.room || "Photo sans pièce"} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => retirerPhoto(p.id)}
                      aria-label="Retirer la photo"
                      className="voix-mono absolute right-1 top-1 flex h-6 w-6 items-center justify-center"
                      style={{ background: "var(--color-basalte)", color: "var(--color-pierre)", fontSize: "0.65rem" }}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    value={p.room}
                    onChange={(e) => nommer(p.id, e.target.value)}
                    onFocus={() => setActif(p.id)}
                    onBlur={() => assainir(p.id)}
                    placeholder="pièce ?"
                    aria-label="Nom de la pièce"
                    className="voix-mono w-full bg-transparent px-2 py-2 outline-none focus-visible:border-(--color-bronze)"
                    style={{
                      border: "1px solid var(--color-filet)",
                      borderTop: "none",
                      color: p.room ? "var(--color-pierre)" : "var(--color-braise-vive)",
                    }}
                  />
                  {actif === p.id ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {PIECES_SUGGEREES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          /* mousedown : avant le blur de l'input, sinon le clic se perd. */
                          onMouseDown={(e) => {
                            e.preventDefault();
                            suggerer(p.id, s);
                            setActif(null);
                          }}
                          className="voix-mono px-2 py-1"
                          style={{
                            border: "1px solid var(--color-filet)",
                            color: "var(--color-gris-pierre)",
                            fontSize: "0.5625rem",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <label
              className="flex cursor-pointer flex-col items-center gap-3 px-6 py-14 text-center"
              style={{ border: "1px dashed var(--color-filet)" }}
            >
              <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
                DÉPOSEZ LES PHOTOS DU BIEN · JPG OU PNG
              </span>
              <span className="voix-mono px-4 py-2.5" style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}>
                Parcourir
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={(e) => {
                  ajouterPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </section>
      ) : null}

      {/* ——— Étape 3 · L'agencement ——— */}
      {etape === 2 ? (
        <section className="flex flex-col gap-4">
          <p
            className="px-4 py-3"
            style={{
              borderLeft: "2px solid var(--color-braise)",
              color: "var(--color-pierre)",
              background: "var(--color-basalte-2)",
              lineHeight: 1.6,
            }}
          >
            Décrivez comment les pièces communiquent (ex. « la cuisine donne sur le séjour par un
            passe-plat ; l&apos;ouverture à droite de l&apos;entrée mène au séjour »). Une description précise,
            ou un plan joint, améliore nettement le résultat.
          </p>
          <textarea
            value={agencement}
            onChange={(e) => setAgencement(e.target.value)}
            rows={6}
            placeholder="L'entrée donne sur…"
            className="w-full resize-y bg-transparent px-3 py-3 outline-none focus-visible:border-(--color-bronze)"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label
              className="voix-mono cursor-pointer px-4 py-2.5"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            >
              {plan ? "Remplacer le plan" : "+ Joindre un plan (image ou PDF)"}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  joindrePlan(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {plan ? (
              <span className="voix-mono" style={{ color: "var(--color-bronze)" }}>
                {plan.nomFichier}
                <button
                  type="button"
                  onClick={() => setPlan(null)}
                  className="ml-3 underline underline-offset-2"
                  style={{ color: "var(--color-gris-pierre)" }}
                >
                  Retirer
                </button>
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ——— Étape 4 · Les options ——— */}
      {etape === 3 ? (
        <section className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              FORMATS LIVRÉS
            </p>
            <div className="flex flex-wrap gap-2">
              <Toggle actif={formats.includes("16:9")} onClick={() => basculerFormat("16:9")}>
                16:9 · PORTAILS
              </Toggle>
              <Toggle actif={formats.includes("9:16")} onClick={() => basculerFormat("9:16")}>
                9:16 · RÉSEAUX
              </Toggle>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              HOME STAGING VIRTUEL
            </p>
            {quotaStaging === null ? (
              <p className="voix-mono" style={{ color: "var(--color-filet)", lineHeight: 1.6 }}>
                NON INCLUS DANS VOTRE FORMULE{formule ? ` ${formule.nom.toUpperCase()}` : ""}. RAPPROCHEZ-VOUS DU
                STUDIO POUR L&apos;AJOUTER.
              </p>
            ) : stagingRestants === 0 && stagingChoisis === 0 ? (
              <p className="voix-mono" style={{ color: "var(--color-filet)", lineHeight: 1.6 }}>
                QUOTA DE STAGING DU MOIS ATTEINT ({quotaStaging} PHOTOS / MOIS).
              </p>
            ) : (
              <>
            {stagingRestants !== null ? (
              <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
                {Math.max(0, stagingRestants - stagingChoisis)} PHOTO
                {Math.max(0, stagingRestants - stagingChoisis) > 1 ? "S" : ""} DE STAGING RESTANTE
                {Math.max(0, stagingRestants - stagingChoisis) > 1 ? "S" : ""} CE MOIS-CI
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {pieces.map((r) => (
                <Toggle key={r} actif={stagingRooms.includes(r)} onClick={() => basculerStaging(r)}>
                  {r}
                </Toggle>
              ))}
            </div>
            {stagingRooms.filter((r) => pieces.includes(r)).length > 0 ? (
              <label className="flex max-w-xs flex-col gap-2">
                <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
                  STYLE
                </span>
                <select
                  value={stagingStyle}
                  onChange={(e) => setStagingStyle(e.target.value as StyleStaging)}
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
                >
                  {STYLES_STAGING.map((s) => (
                    <option key={s} value={s} style={{ background: "var(--color-basalte)" }}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <p className="voix-mono max-w-xl" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
              LE STAGING EST LIVRÉ EN VISUELS AVANT/APRÈS. IL N&apos;APPARAÎT DANS LE FILM QUE POUR LES
              PIÈCES VUES SOUS UN SEUL ANGLE.
            </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              PIÈCES À EXCLURE DU FILM
            </p>
            <div className="flex flex-wrap gap-2">
              {pieces.map((r) => (
                <Toggle key={r} actif={excludeRooms.includes(r)} onClick={() => basculer(excludeRooms, setExcludeRooms, r)}>
                  {r}
                </Toggle>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ——— Étape 5 · Récapitulatif et envoi ——— */}
      {etape === 4 ? (
        <section className="flex flex-col gap-3 p-5" style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}>
          <ul className="flex flex-col gap-1.5">
            {[
              ["BIEN", `${titre.trim()} · ${ville.trim()}`],
              ["PHOTOS", `${photos.length} · ${pieces.join(", ")}`],
              ["AGENCEMENT", agencement.trim() ? "DÉCRIT" : plan ? "PLAN JOINT" : "NON DÉCRIT"],
              ["PLAN", plan ? plan.nomFichier : "AUCUN"],
              ["FORMATS", formats.join(" + ")],
              [
                "STAGING",
                stagingRooms.filter((r) => pieces.includes(r)).length
                  ? `${stagingRooms.filter((r) => pieces.includes(r)).join(", ")} · ${stagingStyle}`
                  : "NON",
              ],
              ["EXCLUSIONS", excludeRooms.filter((r) => pieces.includes(r)).join(", ") || "AUCUNE"],
            ].map(([k, v]) => (
              <li key={k} className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.7 }}>
                <span style={{ color: "var(--color-bronze)" }}>{k} · </span>
                {v}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {erreur ? (
        <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
          {erreur}
        </p>
      ) : null}

      {/* Navigation d'étapes */}
      <div className="flex items-center justify-between gap-4">
        {etape > 0 ? (
          <button
            type="button"
            onClick={() => {
              setErreur("");
              setEtape((n) => n - 1);
            }}
            className="voix-mono px-5 py-3.5"
            style={{ border: "1px solid var(--color-filet)", color: "var(--color-gris-pierre)" }}
          >
            ← Précédent
          </button>
        ) : (
          <span />
        )}
        {etape < ETAPES.length - 1 ? (
          <BoutonBraise onClick={continuer}>Continuer</BoutonBraise>
        ) : (
          <BoutonBraise onClick={envoyer} disabled={enCours}>
            {enCours ? "Envoi…" : "Envoyer la demande"}
          </BoutonBraise>
        )}
      </div>
    </div>
  );
}
