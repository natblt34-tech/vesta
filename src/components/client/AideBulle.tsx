"use client";

import { useState } from "react";
import { backend } from "@/lib/client/backend";

/* Bulle d'aide flottante : le client décrit son besoin, une notification
   part vers le studio. */
export default function AideBulle() {
  const [ouvert, setOuvert] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-90 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {ouvert ? (
        <div
          className="w-72 p-5"
          style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}
        >
          {envoye ? (
            <p className="voix-mono" style={{ color: "var(--color-bronze)", lineHeight: 1.6 }}>
              Message envoyé. Le studio vous répond par email.
            </p>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                await backend.demanderAide(String(data.get("message")));
                setEnvoye(true);
              }}
            >
              <p className="voix-mono mb-3" style={{ color: "var(--color-pierre)" }}>
                UNE QUESTION ?
              </p>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Décrivez votre besoin…"
                className="w-full resize-none bg-transparent p-3 outline-none"
                style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
              />
              <button
                type="submit"
                className="voix-mono mt-3 w-full px-4 py-3"
                style={{ border: "1px solid var(--color-braise)", color: "var(--color-pierre)" }}
              >
                Envoyer
              </button>
            </form>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOuvert((v) => !v);
          setEnvoye(false);
        }}
        aria-label="Demander de l'aide"
        className="flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-200 hover:border-(--color-braise-vive)"
        style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)", color: "var(--color-pierre)" }}
      >
        {ouvert ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 9a3 3 0 1 1 4 2.8c-.9.4-1.5 1-1.5 2.2" strokeLinecap="round" />
            <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
