"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setStatus } from "@/lib/status";
import { MENTION_STAGING } from "@/lib/site";
import { media } from "@/lib/media";

/* /home-staging — le scroll meuble la pièce.
   Le plan de staging se dessine meuble par meuble (ligne claire),
   la caméra suit chaque pose (plans montés, pas un zoom),
   puis la flamme s'allume : la pièce réelle, habitée, chaude.
   Rescroller vers le haut dévêtit la pièce — la preuve que c'est réel. */

const MEUBLES = [
  {
    nom: "CANAPÉ",
    origin: "30% 72%",
    scale: 1.26,
    d: "M370 740 L370 640 C370 615 390 600 415 600 L780 590 C805 589 820 605 822 630 L824 736 M372 698 L822 688 M420 700 L424 750 M778 690 L782 744",
  },
  {
    nom: "TABLE BASSE",
    origin: "56% 76%",
    scale: 1.24,
    d: "M900 668 L1064 660 L1070 700 L906 708 L900 668 M910 706 L912 748 M1056 700 L1058 742",
  },
  {
    nom: "LAMPADAIRE",
    origin: "76% 58%",
    scale: 1.28,
    d: "M1216 790 C1216 784 1246 784 1246 790 M1231 788 L1229 470 C1229 452 1238 444 1252 446 L1270 450 C1290 454 1298 470 1292 488 C1286 505 1268 510 1254 502",
  },
  {
    nom: "TAPIS",
    origin: "50% 84%",
    scale: 1.1,
    d: "M520 770 C560 730 1040 720 1090 760 C1130 792 1080 830 980 838 C820 848 600 844 540 816 C505 800 500 788 520 770",
  },
  {
    nom: "OLIVIER",
    origin: "90% 64%",
    scale: 1.24,
    d: "M1420 780 L1416 720 L1478 716 L1476 778 M1446 718 L1444 640 C1420 600 1408 560 1420 520 M1444 660 C1470 620 1490 590 1512 570 M1444 700 C1410 670 1390 650 1380 620",
  },
  {
    nom: "CADRES",
    origin: "14% 42%",
    scale: 1.28,
    d: "M140 280 L300 300 L296 420 L136 398 L140 280 M150 460 L290 476 L288 540 L148 526 L150 460",
  },
];

export default function StagingScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [poses, setPoses] = useState(0);
  const [flamme, setFlamme] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      /* État final soigné : la pièce habitée, la mention, le compteur plein. */
      reduced.current = true;
      setPoses(MEUBLES.length);
      setFlamme(true);
      setStatus("SALON · FOYER ALLUMÉ");
      const chaud = el.querySelector<HTMLElement>("[data-chaud]");
      if (chaud) chaud.style.clipPath = "none";
      return;
    }

    setStatus("SALON · 0 ÉLÉMENT POSÉ");

    const ctx = gsap.context(() => {
      const scene = el.querySelector<HTMLElement>("[data-scene]");
      const chaud = el.querySelector<HTMLElement>("[data-chaud]");
      const lueur = el.querySelector<HTMLElement>("[data-lueur]");
      const paths = Array.from(el.querySelectorAll<SVGPathElement>("[data-meuble]"));

      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=520%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            if (p > 0.86) {
              setFlamme(true);
              setStatus("SALON · FOYER ALLUMÉ");
            } else {
              setFlamme(false);
              const n = Math.min(MEUBLES.length, Math.floor((p / 0.8) * MEUBLES.length));
              setPoses(n);
              setStatus(`SALON · ${n} ÉLÉMENT${n > 1 ? "S" : ""} POSÉ${n > 1 ? "S" : ""}`);
            }
          },
        },
      });

      /* Chaque meuble : la caméra se déplace (plan monté), le trait se pose,
         un temps mort, puis on repart. */
      const part = 0.8 / MEUBLES.length;
      MEUBLES.forEach((m, i) => {
        const t0 = i * part;
        tl.to(
          scene,
          {
            scale: m.scale,
            transformOrigin: m.origin,
            duration: part * 0.4,
            ease: "power2.inOut",
          },
          t0,
        );
        tl.fromTo(
          paths[i],
          { strokeDashoffset: () => paths[i].getTotalLength() },
          { strokeDashoffset: 0, duration: part * 0.42, ease: "none" },
          t0 + part * 0.3,
        );
        tl.fromTo(
          paths[i],
          { y: -14 },
          { y: 0, duration: part * 0.2, ease: "back.out(2)" },
          t0 + part * 0.55,
        );
      });

      /* La flamme : retour au large, la lumière s'allume, la pièce devient réelle. */
      tl.to(scene, { scale: 1.02, transformOrigin: "50% 50%", duration: 0.08, ease: "power2.inOut" }, 0.8);
      tl.fromTo(
        lueur,
        { opacity: 0 },
        { opacity: 1, duration: 0.05, ease: "none" },
        0.85,
      );
      tl.fromTo(
        chaud,
        { clipPath: "circle(0% at 34% 24%)" },
        { clipPath: "circle(130% at 34% 24%)", duration: 0.13, ease: "none" },
        0.87,
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap}>
      <section className="relative h-svh overflow-hidden">
        <div data-scene className="absolute inset-0 will-change-transform">
          <img
            src={media("salon-vide.webp")}
            alt="Salon vide avant home staging virtuel : parquet, brique, ciel gris"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "saturate(0.82) brightness(0.94)" }}
          />
          <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {MEUBLES.map((m) => (
              <path
                key={m.nom}
                data-meuble
                d={m.d}
                fill="none"
                stroke="var(--color-pierre)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 1px 6px rgba(18,21,26,0.5))" }}
              />
            ))}
          </svg>
          <img
            data-chaud
            src={media("salon-meuble.webp")}
            alt="Le même salon, meublé et habité, lumière chaude du soir"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: "circle(0% at 34% 24%)" }}
          />
        </div>

        <div
          data-lueur
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(circle at 34% 24%, color-mix(in srgb, var(--color-braise-vive) 42%, transparent) 0%, transparent 45%)",
            mixBlendMode: "screen",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-[var(--spacing-marge)]">
          <p
            className="voix-mono"
            style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
          >
            {flamme
              ? "FOYER ALLUMÉ · COLORIMÉTRIE CHAUDE"
              : `HOME STAGING PROGRESSIF · ${poses}/${MEUBLES.length} · ${
                  MEUBLES[Math.min(poses, MEUBLES.length - 1)].nom
                }`}
          </p>
          <p
            className="voix-mono hidden sm:block"
            style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
          >
            RESCROLLEZ VERS LE HAUT : LA PIÈCE SE DÉVÊT
          </p>
        </div>
      </section>

      <p className="voix-mono marge py-6" style={{ color: "var(--color-gris-pierre)" }}>
        {MENTION_STAGING}
      </p>
    </div>
  );
}
