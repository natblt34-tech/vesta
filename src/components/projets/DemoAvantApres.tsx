"use client";

import { useEffect, useRef, useState } from "react";
import { media } from "@/lib/media";

/* Comparateur avant/après à curseur : on glisse la poignée pour révéler
   la photo retouchée. Souris + tactile. Une carte par pièce. */

type Item = { piece: string; avant: string; apres: string; reglages: string };

function Comparateur({ item, sweep }: { item: Item; sweep: boolean }) {
  const zone = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(52);
  const [glisse, setGlisse] = useState(false);

  const deX = (clientX: number) => {
    const el = zone.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(2, Math.min(98, p)));
  };

  /* Petit balayage à l'apparition pour signaler qu'on peut glisser. */
  useEffect(() => {
    if (!sweep) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1100;
    const anim = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      // 52 -> 74 -> 40 -> 52, en douceur
      const e = Math.sin(k * Math.PI * 2) * 22 * (1 - k);
      setPos(52 + e);
      if (k < 1) raf = requestAnimationFrame(anim);
    };
    raf = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(raf);
  }, [sweep]);

  return (
    <figure className="w-full">
      <div
        ref={zone}
        className="relative aspect-3/2 w-full touch-none select-none overflow-hidden"
        style={{ border: "1px solid var(--color-filet)", cursor: "ew-resize" }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setGlisse(true);
          deX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (glisse) deX(e.clientX);
        }}
        onPointerUp={() => setGlisse(false)}
        onPointerCancel={() => setGlisse(false)}
      >
        {/* APRÈS : base */}
        <img
          src={media(item.apres)}
          alt={`${item.piece.toLowerCase()} retouchée`}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {/* AVANT : clippé à gauche de la poignée */}
        <img
          src={media(item.avant)}
          alt={`${item.piece.toLowerCase()} avant retouche`}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          draggable={false}
        />

        {/* Étiquettes */}
        <span
          className="voix-mono pointer-events-none absolute left-3 top-3 px-2 py-1"
          style={{ color: "var(--color-pierre)", background: "color-mix(in srgb, var(--color-basalte) 55%, transparent)" }}
        >
          AVANT
        </span>
        <span
          className="voix-mono pointer-events-none absolute right-3 top-3 px-2 py-1"
          style={{ color: "var(--color-braise-vive)", background: "color-mix(in srgb, var(--color-basalte) 55%, transparent)" }}
        >
          APRÈS
        </span>

        {/* La poignée */}
        <div
          className="pointer-events-none absolute top-0 h-full"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        >
          <div
            className="mx-auto h-full w-px"
            style={{
              background: "var(--color-braise-vive)",
              boxShadow: "0 0 18px 1px color-mix(in srgb, var(--color-braise-vive) 60%, transparent)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              background: "var(--color-basalte-2)",
              border: "1px solid var(--color-braise-vive)",
              boxShadow: "0 0 20px 2px color-mix(in srgb, var(--color-braise) 45%, transparent)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="var(--color-pierre)" strokeWidth="1.6">
              <path d="M9 7l-4 5 4 5M15 7l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <figcaption className="voix-mono mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span style={{ color: "var(--color-pierre)" }}>{item.piece}</span>
        <span style={{ color: "var(--color-gris-pierre)" }}>{item.reglages}</span>
      </figcaption>
    </figure>
  );
}

export default function DemoAvantApres({ retouches }: { retouches: Item[] }) {
  const wrap = useRef<HTMLElement>(null);
  const [vu, setVu] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVu(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={wrap} className="marge py-(--spacing-section)">
      <p className="voix-mono mb-4" style={{ color: "var(--color-braise-vive)" }}>
        01 · LA RETOUCHE
      </p>
      <h2
        className="voix-display max-w-4xl"
        style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)", lineHeight: 0.95 }}
      >
        Glissez pour voir.
      </h2>

      <div className="mt-10 flex flex-col gap-14">
        {retouches.map((item) => (
          <Comparateur key={item.piece} item={item} sweep={vu} />
        ))}
      </div>
    </section>
  );
}
