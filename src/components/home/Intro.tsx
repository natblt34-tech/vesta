"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, gsapEasePierre } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/* L'intro (réf. 333southwabash) : ~2,2 s, une fois par session, skippable.
   La braise naît, la phrase entre par volets, la lettre se remplit d'image,
   le cercle du temple ouvre sur la home. */

const CLEF = "vesta-intro-vue";
const L1 = "LE FEU";
const L2 = "AVANT LA VISITE";

export default function Intro() {
  const [actif, setActif] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    try {
      if (sessionStorage.getItem(CLEF)) return;
    } catch {
      return;
    }
    setActif(true);
  }, []);

  useEffect(() => {
    if (!actif) return;
    const el = scene.current;
    if (!el) return;

    document.documentElement.style.overflow = "hidden";
    const chars = el.querySelectorAll<HTMLElement>("[data-char]");
    const braise = el.querySelector("[data-braise]");
    const phrase = el.querySelector("[data-phrase]");

    const finir = () => {
      try {
        sessionStorage.setItem(CLEF, "1");
      } catch {}
      document.documentElement.style.overflow = "";
      setActif(false);
    };

    const tl = gsap.timeline({ onComplete: finir });
    tlRef.current = tl;

    tl.fromTo(
      braise,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" },
    )
      .fromTo(
        chars,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.55, stagger: 0.035, ease: "power4.out" },
        0.25,
      )
      .to(
        phrase,
        { fontStretch: "125%", duration: 0.9, ease: gsapEasePierre },
        0.5,
      )
      .add(() => {
        phrase?.classList.add("intro-allume");
      }, 1.35)
      .fromTo(
        el,
        { clipPath: "circle(140% at 50% 52%)" },
        { clipPath: "circle(0% at 50% 52%)", duration: 0.7, ease: gsapEasePierre },
        1.6,
      );

    const skip = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        tl.progress(1);
      }
    };
    window.addEventListener("keydown", skip);

    return () => {
      window.removeEventListener("keydown", skip);
      document.documentElement.style.overflow = "";
      tl.kill();
    };
  }, [actif]);

  if (!actif) return null;

  return (
    <div
      ref={scene}
      className="fixed inset-0 z-99 flex items-center justify-center"
      style={{ background: "var(--color-basalte)" }}
      role="presentation"
    >
      <style>{`
        .intro-allume [data-char] {
          background-image: linear-gradient(rgba(18,21,26,0.25), rgba(18,21,26,0.25)), url(/media/salon-apres.webp);
          background-size: cover;
          background-position: center;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>
      <div
        data-braise
        className="braise-point absolute"
        style={{ width: "0.75rem", height: "0.75rem" }}
        aria-hidden="true"
      />
      <p
        data-phrase
        className="voix-display marge text-center"
        style={{
          fontSize: "clamp(2.5rem, 9vw, 8.5rem)",
          fontStretch: "100%",
          color: "var(--color-pierre)",
          lineHeight: 1,
        }}
      >
        {[L1, L2].map((ligne, li) => (
          <span key={li} className="block overflow-hidden py-1">
            {ligne.split("").map((c, i) => (
              <span
                key={i}
                data-char
                className="inline-block will-change-transform"
                style={{ whiteSpace: "pre" }}
              >
                {c}
              </span>
            ))}
          </span>
        ))}
      </p>
      <button
        type="button"
        onClick={() => tlRef.current?.progress(1)}
        className="voix-mono absolute bottom-6 right-[var(--spacing-marge)]"
        style={{ color: "var(--color-gris-pierre)" }}
      >
        Passer l&apos;intro
      </button>
    </div>
  );
}
