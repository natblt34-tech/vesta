"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { setStatus } from "@/lib/status";
import LigneClaire from "@/components/vesta/LigneClaire";

/* /retouche — le scroll est le curseur avant/après.
   Le « avant » est dérivé du « après » par filtres CSS : alignement parfait.
   Le geste propre à la page : le fond de page subit lui-même la retouche
   (basalte → pierre claire) pendant la section fenêtre. */

const DEGRADE =
  "brightness(0.55) saturate(0.55) contrast(0.88) hue-rotate(-10deg)";

export function HeroBrut() {
  const wrap = useRef<HTMLElement>(null);

  useEffect(() => {
    setStatus("CALAGE BLANCS · 0/7");
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector("[data-brut]"),
        { scale: 1.06 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} className="relative flex h-svh items-end overflow-hidden">
      <img
        data-brut
        src="/media/salon-apres.webp"
        alt="Photo brute du salon : sous-exposée, terne, verticales tombantes"
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        style={{ filter: DEGRADE, rotate: "1.6deg", scale: "1.06" }}
      />
      <div className="relative z-1 w-full p-[var(--spacing-marge)] pb-14">
        <h1
          className="voix-display"
          style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)", textShadow: "0 2px 16px rgba(18,21,26,0.7)" }}
        >
          La retouche
        </h1>
        <p
          className="voix-mono mt-4"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
        >
          IMG_4032 · SMARTPHONE AGENT · 1/60 S · ISO 800 · BRUT
        </p>
      </div>
    </section>
  );
}

export function Wipe() {
  const wrap = useRef<HTMLDivElement>(null);
  const [etape, setEtape] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const apres = el.querySelector<HTMLElement>("[data-apres]");
      const bord = el.querySelector<HTMLElement>("[data-bord]");
      const avant = el.querySelector<HTMLElement>("[data-avant]");

      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: 0.4,
          onUpdate: (self) => {
            const p = self.progress;
            const pc = p * 118 - 9;
            if (apres) apres.style.clipPath = `polygon(0 0, ${pc}% 0, ${pc - 8}% 100%, 0 100%)`;
            if (bord) {
              bord.style.left = `${Math.max(0, Math.min(100, pc - 4))}%`;
              bord.style.opacity = p > 0.02 && p < 0.98 ? "1" : "0";
            }
            if (avant) avant.style.rotate = `${1.6 * (1 - p)}deg`;
            const e = Math.min(3, Math.max(0, Math.floor(p * 3.4)));
            setEtape(e);
            setStatus(`CALAGE BLANCS · ${e + 1}/7`);
          },
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const labels = ["+1.3 EV", "+1.3 EV · VERTICALES", "+1.3 EV · VERTICALES · CIEL 18H40", "+1.3 EV · VERTICALES · CIEL 18H40 · GRAIN 12%"];

  return (
    <div ref={wrap}>
      <section className="relative h-svh overflow-hidden">
        <img
          data-avant
          src="/media/salon-apres.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: DEGRADE, rotate: "1.6deg", scale: "1.06" }}
        />
        <img
          data-apres
          src="/media/salon-apres.webp"
          alt="La même photo, retouchée : lumière du soir, verticales droites"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: "polygon(0 0, 0% 0, 0% 100%, 0 100%)" }}
        />
        <div
          data-bord
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-full w-px opacity-0"
          style={{
            background:
              "linear-gradient(180deg, transparent, var(--color-braise-vive) 30%, var(--color-braise-vive) 70%, transparent)",
            boxShadow: "0 0 24px 2px color-mix(in srgb, var(--color-braise-vive) 55%, transparent)",
          }}
        />
        <p
          className="voix-mono absolute bottom-10 left-[var(--spacing-marge)]"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
        >
          {labels[etape]}
        </p>
        <p
          className="voix-mono absolute bottom-10 right-[var(--spacing-marge)]"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
        >
          VOUS TENEZ LE CURSEUR
        </p>
      </section>
    </div>
  );
}

/* L'histogramme est le graphisme : la courbe écrasée à gauche se redresse. */
const COURBE_AVANT = [88, 62, 30, 16, 10, 7, 5, 4, 3, 3, 2, 2];
const COURBE_APRES = [12, 22, 38, 52, 60, 55, 46, 40, 34, 26, 16, 8];

export function Histogramme() {
  const wrap = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !path.current) return;

    const tracer = (t: number) => {
      const pts = COURBE_AVANT.map((a, i) => {
        const v = a + (COURBE_APRES[i] - a) * t;
        const x = (i / (COURBE_AVANT.length - 1)) * 480;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${(100 - v).toFixed(1)}`;
      });
      path.current?.setAttribute("d", pts.join(" "));
    };

    if (prefersReducedMotion()) {
      tracer(1);
      return;
    }

    tracer(0);
    const ctx = gsap.context(() => {
      const proxy = { t: 0 };
      gsap.to(proxy, {
        t: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          end: "center 40%",
          scrub: 0.5,
          onEnter: () => setStatus("COURBE · TONS MOYENS +12"),
          onEnterBack: () => setStatus("COURBE · TONS MOYENS +12"),
        },
        onUpdate: () => tracer(proxy.t),
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} className="marge grid items-center gap-12 py-(--spacing-section) md:grid-cols-2">
      <div>
        <h2 className="voix-display" style={{ fontSize: "var(--text-titre)", color: "var(--page-fg)" }}>
          Ce qu&apos;on corrige
          <br />
          se mesure.
        </h2>
        <p className="mt-6 max-w-md" style={{ color: "var(--page-fg-2)" }}>
          Exposition, balance des blancs, verticales, ciels, grain. Chaque photo
          d&apos;annonce repasse au banc. Pas de préréglage appliqué en lot : un
          étalonnage par pièce, parce que la lumière n&apos;est jamais la même.
        </p>
      </div>
      <figure aria-label="Histogramme : la courbe des tons se rééquilibre">
        <svg viewBox="0 0 480 110" className="w-full">
          <path ref={path} fill="none" stroke="var(--color-bronze)" strokeWidth="1.5" />
          <line x1="0" y1="104" x2="480" y2="104" stroke="var(--page-filet)" strokeWidth="1" />
        </svg>
        <figcaption className="voix-mono mt-3" style={{ color: "var(--color-bronze)" }}>
          HISTOGRAMME · AVANT → APRÈS · SCRUB
        </figcaption>
      </figure>
    </section>
  );
}

/* La fenêtre : le ciel passe du gris à l'heure dorée — et le fond de page
   avec lui. C'est la respiration claire du parcours, gagnée par le scroll. */
export function Fenetre() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      /* État final soigné : page claire d'emblée. */
      const root = document.documentElement;
      root.style.setProperty("--page-bg", "#e5e0d6");
      root.style.setProperty("--page-fg", "#16191e");
      root.style.setProperty("--page-fg-2", "#6e6a61");
      root.style.setProperty("--page-filet", "#c9c3b6");
      return;
    }

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.5,
          onEnter: () => setStatus("CIEL · 12H00 → 18H40"),
          onEnterBack: () => setStatus("CIEL · 12H00 → 18H40"),
        },
      })
        .fromTo(
          el.querySelector("[data-chaleur]"),
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "none" },
          0,
        )
        .fromTo(
          el.querySelector("[data-froid]"),
          { filter: "saturate(0.85) brightness(0.92)" },
          { filter: "saturate(1.05) brightness(1.02)", duration: 0.6, ease: "none" },
          0,
        )
        .to(
          "html",
          {
            "--page-bg": "#e5e0d6",
            "--page-fg": "#16191e",
            "--page-fg-2": "#6e6a61",
            "--page-filet": "#c9c3b6",
            duration: 0.5,
            ease: "none",
          },
          0.45,
        );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap}>
      <section className="relative h-svh overflow-hidden">
        <img
          data-froid
          src="/media/salon-vide.webp"
          alt="Pièce vide, ciel gris derrière les fenêtres"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          data-chaleur
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "linear-gradient(200deg, color-mix(in srgb, var(--color-braise-vive) 26%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 62% 38%, color-mix(in srgb, var(--color-braise-vive) 30%, transparent) 0%, transparent 50%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(rgba(18,21,26,0) 60%, rgba(18,21,26,0.35))",
          }}
        />
        <p
          className="voix-mono absolute bottom-10 left-[var(--spacing-marge)]"
          style={{ color: "var(--color-pierre)", textShadow: "0 1px 8px rgba(18,21,26,0.8)" }}
        >
          LE CIEL EST REFAIT À L&apos;HEURE OÙ LE BIEN EST LE PLUS BEAU
        </p>
      </section>
    </div>
  );
}

/* Série rapide : trois corrections nommées, sur fond devenu clair. */
const SERIE = [
  { img: "salon-apres", pos: "20% 40%", label: "SÉJOUR · +1.1 EV · VERTICALES" },
  { img: "cuisine-porte", pos: "55% 50%", label: "CUISINE · BALANCE 3800K → 5200K" },
  { img: "salon-meuble", pos: "70% 60%", label: "SÉJOUR · CIEL · GRAIN 12%" },
];

export function Serie() {
  const wrap = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-piece]").forEach((p) => {
        gsap.fromTo(
          p,
          { filter: DEGRADE },
          {
            filter: "brightness(1) saturate(1) contrast(1) hue-rotate(0deg)",
            ease: "none",
            scrollTrigger: { trigger: p, start: "top 80%", end: "top 35%", scrub: 0.5 },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} className="marge py-(--spacing-section)">
      <h2 className="voix-mono mb-10" style={{ color: "var(--color-bronze)" }}>
        LA SÉRIE · CHAQUE PHOTO PASSE AU BANC
      </h2>
      <div className="grid gap-10 md:grid-cols-3">
        {SERIE.map((s) => (
          <figure key={s.label}>
            <div
              data-piece
              className="aspect-4/3 will-change-[filter]"
              style={{
                backgroundImage: `url(/media/${s.img}.webp)`,
                backgroundSize: "180%",
                backgroundPosition: s.pos,
              }}
              role="img"
              aria-label={`Photo retouchée — ${s.label.toLowerCase()}`}
            />
            <figcaption className="voix-mono mt-3" style={{ color: "var(--page-fg-2)" }}>
              {s.label}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-16 hidden w-24 md:block" aria-hidden="true">
        <LigneClaire variant="cadre" ton="encre" />
      </div>
    </section>
  );
}
