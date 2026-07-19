"use client";

import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/* Ajuste la taille des lignes display à la largeur disponible.
   Chaque élément [data-fit] (en nowrap) est mesuré puis réduit
   pour tenir exactement dans son parent — le type remplit la ligne,
   il ne déborde jamais. */

export function fitLines(scope: HTMLElement) {
  const els = scope.matches("[data-fit]")
    ? [scope]
    : Array.from(scope.querySelectorAll<HTMLElement>("[data-fit]"));

  /* Garde-fou : jamais plus large que le viewport moins les marges,
     même si un parent flex en max-content prétend offrir plus. */
  const marges = Math.max(20, window.innerWidth * 0.04) * 2;
  const cap = document.documentElement.clientWidth - marges;

  for (const el of els) {
    /* La taille d'origine peut venir d'un style inline (React) :
       on la mémorise au premier passage et on la restaure avant de mesurer. */
    if (el.dataset.fitBase === undefined) {
      el.dataset.fitBase = el.style.fontSize;
    }
    el.style.fontSize = el.dataset.fitBase;
    const parent = el.parentElement;
    if (!parent) continue;
    const avail = Math.min(parent.clientWidth, cap);
    const largeur = el.scrollWidth;
    if (avail > 0 && largeur > avail) {
      const actuelle = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${((actuelle * avail) / largeur) * 0.985}px`;
    }
  }
}

export function useFitText(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      fitLines(el);
      ScrollTrigger.refresh();
    };

    run();
    document.fonts?.ready.then(() => {
      if (ref.current) run();
    });
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, [ref]);
}
