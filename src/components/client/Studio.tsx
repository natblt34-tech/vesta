"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/chrome/Transition";
import { Etoile } from "@/components/chrome/Logo";
import { useAuth } from "@/lib/client/auth";
import { backend } from "@/lib/client/backend";
import { importerVideoSession } from "@/lib/client/media";
import type { Mandat } from "@/lib/client/types";

/* Interface studio (côté Vesta) : voir toutes les demandes, ouvrir un
   mandat, déposer la vidéo produite -> le client est notifié par email. */
export default function Studio() {
  const router = useRouter();
  const { user, pret, deconnexion } = useAuth();
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [ouvert, setOuvert] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setMandats(await backend.tousLesMandats());
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

  const mandat = mandats.find((m) => m.id === ouvert) ?? null;

  const deposer = async (mandatId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { url, nom } = importerVideoSession(files[0]);
    await backend.deposerProduction(mandatId, url, nom);
    await charger();
  };

  return (
    <main className="marge min-h-svh py-20" style={{ background: "var(--color-basalte)" }}>
      <header className="mb-14 flex flex-wrap items-center justify-between gap-4">
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

      {mandat ? (
        <div className="flex max-w-3xl flex-col gap-8">
          <button
            type="button"
            onClick={() => setOuvert(null)}
            className="voix-mono self-start underline underline-offset-4"
            style={{ color: "var(--color-gris-pierre)" }}
          >
            ← Toutes les demandes
          </button>

          <div>
            <h2 className="voix-display" style={{ fontSize: "var(--text-titre)", color: "var(--color-pierre)" }}>
              {mandat.nom}
            </h2>
            <p className="voix-mono mt-2" style={{ color: "var(--color-gris-pierre)" }}>
              {mandat.clientEmail} · {mandat.photos.length} PHOTOS · {mandat.connexions.length} CONNEXIONS
            </p>
          </div>

          {mandat.description ? <p style={{ color: "var(--color-gris-pierre)" }}>{mandat.description}</p> : null}

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {mandat.photos.map((p) => (
              <img key={p.id} src={p.url} alt={p.nom} className="aspect-4/3 w-full object-cover" style={{ border: "1px solid var(--color-filet)" }} />
            ))}
          </div>

          {mandat.connexions.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {mandat.connexions.map((c, i) => (
                <li key={c.id} className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--color-bronze)" }}>CONNEXION {String(i + 1).padStart(2, "0")} · </span>
                  {c.description}
                </li>
              ))}
            </ul>
          ) : null}

          <section className="flex flex-col gap-3 p-5" style={{ border: "1px solid var(--color-braise)", background: "var(--color-basalte-2)" }}>
            <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
              DÉPOSER LA PRODUCTION
            </p>
            {mandat.production ? (
              <p className="voix-mono" style={{ color: "var(--color-pierre)" }}>
                VIDÉO DÉPOSÉE : {mandat.production.nom}. LE CLIENT A ÉTÉ NOTIFIÉ.
              </p>
            ) : null}
            <label
              className="voix-mono cursor-pointer self-start px-5 py-3"
              style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
            >
              {mandat.production ? "Remplacer la vidéo" : "Choisir la vidéo"}
              <input type="file" accept="video/*" className="hidden" onChange={(e) => deposer(mandat.id, e.target.files)} />
            </label>
          </section>
        </div>
      ) : (
        <ul className="flex max-w-3xl flex-col">
          {mandats.length === 0 ? (
            <p className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
              AUCUNE DEMANDE POUR L&apos;INSTANT.
            </p>
          ) : (
            mandats.map((m) => (
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
                  <span className="voix-mono" style={{ color: m.production ? "var(--color-braise-vive)" : "var(--color-bronze)" }}>
                    {m.clientEmail} · {m.production ? "LIVRÉ" : "À PRODUIRE"}
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
