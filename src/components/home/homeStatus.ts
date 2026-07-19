"use client";

/* Le statut de la home compose un timecode global + le plan courant.
   Les sections déclarent leur plan ; le trigger de page fournit la progression. */

import { setStatus } from "@/lib/status";

const DUREE = 47;

let plan = "OUVERTURE";
let secondes = 0;

function composer() {
  const s = Math.min(DUREE, Math.round(secondes));
  const ss = String(s).padStart(2, "0");
  setStatus(`00:${ss} / 00:${DUREE} · ${plan}`);
}

export function setPlan(p: string) {
  plan = p;
  composer();
}

export function setProgression(p: number) {
  secondes = p * DUREE;
  composer();
}
