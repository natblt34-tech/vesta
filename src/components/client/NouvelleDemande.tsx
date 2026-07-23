"use client";

import { useMemo, useState } from "react";
import { backend } from "@/lib/client/backend";
import { importerFichier, importerPhoto } from "@/lib/client/media";
import { assainirPiece, PIECES_SUGGEREES, piecesDistinctes, suffixerPiece } from "@/lib/client/pieces";
import { STYLES_STAGING, type Format, type StyleStaging } from "@/lib/client/types";

const MAX_PHOTOS = 20;

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

function Legende({ children }: { children: React.ReactNode }) {
  return (
    <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
      {children}
    </p>
  );
}

/* Le formulaire de demande : c'est l'entrée du pipeline de production.
   Les noms de pièces des photos en sont la clé — suggestions cliquables,
   suffixe numérique automatique. */
export default function NouvelleDemande({ onEnvoye }: { onEnvoye: () => void }) {
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

  const retirerPhoto = (pid: string) => {
    setPhotos((p) => p.filter((x) => x.id !== pid));
  };

  const nommer = (pid: string, room: string) => {
    setPhotos((p) => p.map((x) => (x.id === pid ? { ...x, room } : x)));
  };

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

  const basculer = (liste: string[], setListe: (v: string[]) => void, room: string) => {
    setListe(liste.includes(room) ? liste.filter((r) => r !== room) : [...liste, room]);
  };

  const basculerFormat = (f: Format) => {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const joindrePlan = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setPlan(await importerFichier(files[0]));
    } catch {
      setErreur("Le plan n'a pas pu être importé.");
    }
  };

  const envoyer = async () => {
    const sansNom = photos.filter((p) => !p.room.trim()).length;
    if (!titre.trim() || !ville.trim()) return setErreur("Nom du bien et ville sont nécessaires.");
    if (photos.length === 0) return setErreur("Déposez au moins une photo.");
    if (sansNom > 0) return setErreur(`${sansNom} photo(s) sans nom de pièce. Nommez chaque photo.`);
    if (formats.length === 0) return setErreur("Choisissez au moins un format.");
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

  return (
    <div className="flex flex-col gap-12">
      {/* Le bien */}
      <section className="flex flex-col gap-5">
        <Legende>LE BIEN</Legende>
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <label className="flex flex-col gap-2">
            <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              NOM DU BIEN
            </span>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex : T2 lumineux, dernier étage"
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
        </div>
      </section>

      {/* Les photos, nommées par pièce */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Legende>
            LES PHOTOS · {photos.length}/{MAX_PHOTOS}
          </Legende>
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
          8 À 12 PHOTOS RECOMMANDÉES · CHAQUE PHOTO DOIT PORTER LE NOM DE SA PIÈCE
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
          <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
            AUCUNE PHOTO POUR L&apos;INSTANT
          </p>
        )}
      </section>

      {/* L'agencement */}
      <section className="flex flex-col gap-4">
        <Legende>L&apos;AGENCEMENT</Legende>
        <p
          className="max-w-xl px-4 py-3"
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
          rows={5}
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

      {/* Les options */}
      <section className="flex flex-col gap-6">
        <Legende>LES OPTIONS</Legende>

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
          {pieces.length === 0 ? (
            <p className="voix-mono" style={{ color: "var(--color-filet)" }}>
              NOMMEZ VOS PHOTOS POUR CHOISIR LES PIÈCES À MEUBLER
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {pieces.map((r) => (
                  <Toggle key={r} actif={stagingRooms.includes(r)} onClick={() => basculer(stagingRooms, setStagingRooms, r)}>
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
          {pieces.length === 0 ? (
            <p className="voix-mono" style={{ color: "var(--color-filet)" }}>
              AUCUNE PIÈCE NOMMÉE
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pieces.map((r) => (
                <Toggle key={r} actif={excludeRooms.includes(r)} onClick={() => basculer(excludeRooms, setExcludeRooms, r)}>
                  {r}
                </Toggle>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Récapitulatif */}
      <section className="flex flex-col gap-3 p-5" style={{ border: "1px solid var(--color-filet)" }}>
        <Legende>RÉCAPITULATIF</Legende>
        <ul className="flex flex-col gap-1.5">
          {[
            ["BIEN", titre.trim() ? `${titre.trim()}${ville.trim() ? ` · ${ville.trim()}` : ""}` : "À RENSEIGNER"],
            ["PHOTOS", photos.length ? `${photos.length} · ${pieces.join(", ") || "PIÈCES À NOMMER"}` : "AUCUNE"],
            ["AGENCEMENT", agencement.trim() ? "DÉCRIT" : plan ? "PLAN JOINT" : "NON DÉCRIT"],
            ["PLAN", plan ? plan.nomFichier : "AUCUN"],
            ["FORMATS", formats.length ? formats.join(" + ") : "AUCUN"],
            [
              "STAGING",
              stagingRooms.filter((r) => pieces.includes(r)).length
                ? `${stagingRooms.filter((r) => pieces.includes(r)).join(", ")} · ${stagingStyle}`
                : "NON",
            ],
            ["EXCLUSIONS", excludeRooms.filter((r) => pieces.includes(r)).join(", ") || "AUCUNE"],
          ].map(([k, v]) => (
            <li key={k} className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--color-bronze)" }}>{k} · </span>
              {v}
            </li>
          ))}
        </ul>
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
