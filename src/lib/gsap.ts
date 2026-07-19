"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Easings de la charte (vesta-brand). Miroir des tokens CSS. */
export const EASE_PIERRE = "cubic-bezier(0.65, 0, 0.15, 1)";
export const EASE_POIDS = "cubic-bezier(0.34, 1.28, 0.44, 1)";

export const gsapEasePierre = "power3.inOut";
export const gsapEaseBraise = "power4.out";
export const gsapEasePoids = "back.out(1.4)";

export { gsap, ScrollTrigger };
