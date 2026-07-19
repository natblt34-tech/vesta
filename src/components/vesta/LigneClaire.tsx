"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/* Direction A — la ligne claire.
   Un seul trait continu qui se dessine au scroll et change de nature
   selon la section : Vesta, plan de maison, flamme, cadre de caméra. */

const TRACES: Record<string, { viewBox: string; d: string }> = {
  /* Silhouette voilée de Vesta, un seul trait : voile, profil, épaule, main levée portant la flamme. */
  vesta: {
    viewBox: "0 0 200 320",
    d: "M60 300 C 40 240, 34 190, 44 140 C 50 108, 62 78, 88 58 C 104 46, 124 42, 138 52 C 150 61, 152 78, 146 92 C 142 102, 133 108, 128 118 C 124 126, 126 136, 132 142 C 140 150, 152 152, 158 162 C 163 171, 160 183, 150 188 C 138 194, 124 190, 116 200 C 108 210, 110 226, 118 240 C 126 254, 140 262, 148 276",
  },
  /* Plan de maison en un trait : murs, refends, baie. */
  maison: {
    viewBox: "0 0 200 320",
    d: "M30 290 L 30 60 L 170 60 L 170 290 L 30 290 M 30 170 L 96 170 M 96 170 L 96 60 M 96 230 L 170 230 M 130 230 L 130 290",
  },
  /* La flamme : double courbe, cœur intérieur. */
  flamme: {
    viewBox: "0 0 200 320",
    d: "M100 292 C 60 258, 48 216, 60 176 C 68 148, 88 126, 96 98 C 100 84, 98 68, 92 54 C 112 68, 128 90, 136 116 C 146 148, 144 184, 130 214 C 122 231, 110 244, 104 262 C 100 274, 100 283, 100 292 M 100 244 C 86 228, 84 206, 92 190 C 97 180, 104 172, 106 160 C 114 174, 118 192, 112 210 C 108 222, 102 232, 100 244",
  },
  /* Le cadre caméra : quatre coins, un seul trait qui les relie en pointillé d'intention. */
  cadre: {
    viewBox: "0 0 200 320",
    d: "M40 120 L 40 88 L 72 88 M 128 88 L 160 88 L 160 120 M 160 200 L 160 232 L 128 232 M 72 232 L 40 232 L 40 200 M 92 160 L 108 160",
  },
};

type Props = {
  variant: keyof typeof TRACES;
  className?: string;
  /* Couleur du trait : pierre par défaut, bronze pour les marges. */
  ton?: "pierre" | "bronze" | "encre" | "braise";
  /* false : trait complet immédiatement (couches de survol, états statiques). */
  dessine?: boolean;
};

export default function LigneClaire({ variant, className, ton = "bronze", dessine = true }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const trace = TRACES[variant];

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const path = el.querySelector("path");
    if (!path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    if (!dessine || prefersReducedMotion()) {
      path.style.strokeDashoffset = "0";
      return;
    }

    path.style.strokeDashoffset = `${length}`;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "bottom 30%",
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(path, { strokeDashoffset: length * (1 - self.progress) });
      },
    });

    return () => st.kill();
  }, [variant, dessine]);

  const stroke =
    ton === "pierre"
      ? "var(--color-pierre)"
      : ton === "encre"
        ? "var(--color-encre)"
        : ton === "braise"
          ? "var(--color-braise-vive)"
          : "var(--color-bronze)";

  return (
    <svg
      ref={svg}
      viewBox={trace.viewBox}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d={trace.d}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
